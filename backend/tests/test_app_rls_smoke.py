import os
import io
import uuid
import pytest
import pytest_asyncio
import jwt
from httpx import AsyncClient, ASGITransport
import sqlalchemy as sa
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from reportlab.lib.pagesizes import letter
from reportlab.pdfgen import canvas
from dotenv import dotenv_values
import re

from app.main import app
from app.config import settings
from app.database import get_db, Base
from app.models.financials import User, DecisionSimulation

# Resolve live PostgreSQL connection
env_path = os.path.join(os.path.dirname(__file__), '..', '..', '.env.local')
env = dotenv_values(env_path) if os.path.exists(env_path) else {}

raw_db_url = os.getenv("TEST_DATABASE_URL") or os.getenv("DATABASE_URL") or env.get("DATABASE_URL", "")
m = re.match(r'postgresql://([^:]+):(.*)@([^:/]+)(?::(\d+))?/(.*)', raw_db_url.strip('\"\''))
if m:
    _, password, _, _, dbname = m.groups()
    dbname = dbname or "postgres"
    TEST_POSTGRES_ASYNC_URL = f"postgresql+asyncpg://postgres.qszgfpeqmkdqbjbacrol:{password}@aws-0-ap-southeast-1.pooler.supabase.com:5432/{dbname}"
else:
    TEST_POSTGRES_ASYNC_URL = ""

is_postgres = bool(TEST_POSTGRES_ASYNC_URL)

pytestmark = pytest.mark.skipif(
    not is_postgres,
    reason="Live PostgreSQL RLS smoke test requires PostgreSQL connection"
)

def create_synthetic_pdf_bytes() -> bytes:
    buf = io.BytesIO()
    c = canvas.Canvas(buf, pagesize=letter)
    width, height = letter
    c.setFont("Helvetica-Bold", 16)
    c.drawString(100, height - 80, "SYNTHETIC SALARY STATEMENT")
    c.setFont("Helvetica", 10)
    c.drawString(100, height - 120, "Employer: Acme Corp")
    c.drawString(100, height - 140, "Monthly Salary: Rs. 150,000")
    c.drawString(100, height - 160, "Basic Pay: Rs. 75,000")
    c.drawString(100, height - 180, "HRA: Rs. 35,000")
    c.drawString(100, height - 200, "Special Allowance: Rs. 40,000")
    c.showPage()
    c.save()
    buf.seek(0)
    return buf.read()

def generate_jwt(user_id: uuid.UUID, email: str, full_name: str) -> str:
    payload = {
        "sub": str(user_id),
        "email": email,
        "aud": "authenticated",
        "user_metadata": {"full_name": full_name}
    }
    return jwt.encode(payload, settings.JWT_SECRET, algorithm="HS256")

@pytest_asyncio.fixture
async def app_client():
    # Setup live async engine connected to Supabase
    pg_engine = create_async_engine(TEST_POSTGRES_ASYNC_URL, echo=False)
    session_factory = async_sessionmaker(pg_engine, class_=AsyncSession, expire_on_commit=False)

    async def override_get_db():
        async with session_factory() as session:
            try:
                yield session
                await session.commit()
            except Exception:
                await session.rollback()
                raise
            finally:
                await session.close()

    app.dependency_overrides[get_db] = override_get_db

    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://testserver") as client:
        yield client, pg_engine

    app.dependency_overrides.clear()
    await pg_engine.dispose()

@pytest.mark.asyncio
async def test_full_application_rls_suite(app_client):
    client, pg_engine = app_client
    session_factory = async_sessionmaker(pg_engine, class_=AsyncSession, expire_on_commit=False)

    # 1. Inspect Role / User in DB
    async with session_factory() as session:
        res = await session.execute(sa.text("SELECT current_user, session_user;"))
        cu, su = res.fetchone()
        assert cu is not None
        assert su is not None

    # Setup Tenant A and Tenant B identities
    tenant_a_id = uuid.uuid4()
    tenant_b_id = uuid.uuid4()
    email_a = f"tenant_a_{tenant_a_id.hex[:8]}@example.com"
    email_b = f"tenant_b_{tenant_b_id.hex[:8]}@example.com"
    name_a = "Tenant Alpha"
    name_b = "Tenant Beta"

    token_a = generate_jwt(tenant_a_id, email_a, name_a)
    token_b = generate_jwt(tenant_b_id, email_b, name_b)

    headers_a = {"Authorization": f"Bearer {token_a}"}
    headers_b = {"Authorization": f"Bearer {token_b}"}

    try:
        # ========================================================
        # 2. AUTHENTICATED APPLICATION REQUEST: /api/v1/auth/me
        # ========================================================
        res_me_a = await client.get("/api/v1/auth/me", headers=headers_a)
        assert res_me_a.status_code == 200, f"Auth me failed: {res_me_a.text}"
        data_me_a = res_me_a.json()
        assert data_me_a["id"] == str(tenant_a_id)
        assert data_me_a["email"] == email_a

        res_me_b = await client.get("/api/v1/auth/me", headers=headers_b)
        assert res_me_b.status_code == 200
        assert res_me_b.json()["id"] == str(tenant_b_id)

        # ========================================================
        # 3. PROFILE ENDPOINTS
        # ========================================================
        # GET /api/v1/profile
        res_prof_a = await client.get("/api/v1/profile", headers=headers_a)
        assert res_prof_a.status_code == 200
        assert res_prof_a.json()["user_id"] == str(tenant_a_id)

        # PUT /api/v1/profile (Update)
        res_upd_prof = await client.put(
            "/api/v1/profile",
            json={"city": "Bengaluru", "age": 32, "monthly_income": 180000.0, "monthly_expenses": 90000.0},
            headers=headers_a
        )
        assert res_upd_prof.status_code == 200
        assert res_upd_prof.json()["city"] == "Bengaluru"

        # ========================================================
        # 4. DASHBOARD: /api/v1/dashboard/summary
        # ========================================================
        res_dash = await client.get("/api/v1/dashboard/summary", headers=headers_a)
        assert res_dash.status_code == 200, f"Dashboard failed: {res_dash.text}"
        dash_data = res_dash.json()
        assert "financial_health" in dash_data
        assert "net_worth" in dash_data

        # ========================================================
        # 5. FINANCIAL CRUD (Incomes, Expenses, Assets, Liabilities, Goals, Investments, Insurance)
        # ========================================================
        # Income CRUD
        inc_payload = {"source_name": "Tech Salary", "type": "Salary", "amount": 180000.0, "frequency": "Monthly", "active": True}
        res_inc = await client.post("/api/v1/incomes", json=inc_payload, headers=headers_a)
        assert res_inc.status_code == 200
        inc_id = res_inc.json()["id"]
        assert res_inc.json()["user_id"] == str(tenant_a_id)

        # Expense CRUD
        exp_payload = {"category": "Groceries & Rent", "amount": 50000.0, "essential": True}
        res_exp = await client.post("/api/v1/expenses", json=exp_payload, headers=headers_a)
        assert res_exp.status_code == 200
        assert res_exp.json()["user_id"] == str(tenant_a_id)

        # Asset CRUD
        asset_payload = {"asset_name": "Equity Index Fund", "asset_type": "MutualFunds", "current_value": 450000.0}
        res_asset = await client.post("/api/v1/assets", json=asset_payload, headers=headers_a)
        assert res_asset.status_code == 200
        asset_id = res_asset.json()["id"]
        assert res_asset.json()["user_id"] == str(tenant_a_id)

        # Liability CRUD
        liab_payload = {
            "loan_name": "Car Loan",
            "loan_type": "AutoLoan",
            "principal": 600000.0,
            "outstanding": 450000.0,
            "interest_rate": 9.0,
            "emi": 15000.0
        }
        res_liab = await client.post("/api/v1/liabilities", json=liab_payload, headers=headers_a)
        assert res_liab.status_code == 200
        assert res_liab.json()["user_id"] == str(tenant_a_id)

        # Goal CRUD
        goal_payload = {"goal_name": "Emergency Cushion", "category": "Emergency", "target_amount": 600000.0, "saved_amount": 200000.0, "monthly_contribution": 20000.0, "priority": "Critical", "status": "Active"}
        res_goal = await client.post("/api/v1/goals", json=goal_payload, headers=headers_a)
        assert res_goal.status_code == 200
        goal_id = res_goal.json()["id"]
        assert res_goal.json()["user_id"] == str(tenant_a_id)

        # Investment CRUD
        inv_payload = {"investment_type": "FixedDeposit", "platform": "HDFC", "invested_amount": 200000.0, "current_value": 210000.0, "expected_return": 7.0, "risk_level": "Low"}
        res_inv = await client.post("/api/v1/investments", json=inv_payload, headers=headers_a)
        assert res_inv.status_code == 200
        assert res_inv.json()["user_id"] == str(tenant_a_id)

        # Insurance CRUD
        ins_payload = {"policy_name": "Health Shield", "provider": "HDFC Ergo", "coverage": 1000000.0, "premium": 15000.0, "status": "Active"}
        res_ins = await client.post("/api/v1/insurance", json=ins_payload, headers=headers_a)
        assert res_ins.status_code == 200
        assert res_ins.json()["user_id"] == str(tenant_a_id)

        # ========================================================
        # 6. DOCUMENT FLOW (Upload, List, Detail, Search)
        # ========================================================
        pdf_bytes = create_synthetic_pdf_bytes()
        files = {"file": ("salary_slip_synthetic.pdf", pdf_bytes, "application/pdf")}
        res_doc_up = await client.post("/api/v1/documents/upload", files=files, headers=headers_a)
        assert res_doc_up.status_code == 200, f"Doc upload failed: {res_doc_up.text}"
        doc_upload_data = res_doc_up.json()
        doc_id_a = doc_upload_data["document_id"]
        assert doc_upload_data["status"] == "PROCESSED"
        assert doc_upload_data["chunks_created"] > 0

        # Document List
        res_docs = await client.get("/api/v1/documents", headers=headers_a)
        assert res_docs.status_code == 200
        doc_ids = [d["id"] for d in res_docs.json()]
        assert doc_id_a in doc_ids

        # Document Detail
        res_doc_det = await client.get(f"/api/v1/documents/{doc_id_a}", headers=headers_a)
        assert res_doc_det.status_code == 200
        assert res_doc_det.json()["id"] == doc_id_a

        # Document Search
        res_doc_srch = await client.get("/api/v1/documents/search?q=Salary", headers=headers_a)
        assert res_doc_srch.status_code == 200

        # ========================================================
        # 7. CHAT / CFO FLOW
        # ========================================================
        # CFO Query
        res_cfo = await client.post("/api/v1/cfo/query", json={"query": "Can I afford a 15 Lakh car loan?"}, headers=headers_a)
        assert res_cfo.status_code == 200, f"CFO query failed: {res_cfo.text}"
        assert "answer" in res_cfo.json()

        # Chat Sessions & Messages
        res_sess = await client.post("/api/v1/chat/sessions", json={"title": "Car Purchase Planning"}, headers=headers_a)
        assert res_sess.status_code == 200
        conv_id_a = res_sess.json()["id"]

        res_sess_list = await client.get("/api/v1/chat/sessions", headers=headers_a)
        assert res_sess_list.status_code == 200
        assert conv_id_a in [s["id"] for s in res_sess_list.json()]

        # ========================================================
        # 8. MEMORY FLOW
        # ========================================================
        res_mem = await client.post("/api/v1/memories", json={"memory_type": "Preference", "summary": "Prefers index funds", "importance_score": 8}, headers=headers_a)
        assert res_mem.status_code == 200
        mem_id_a = res_mem.json()["id"]

        res_mem_list = await client.get("/api/v1/memories", headers=headers_a)
        assert res_mem_list.status_code == 200
        assert mem_id_a in [m["id"] for m in res_mem_list.json()]

        # ========================================================
        # 9. SIMULATION FLOW
        # ========================================================
        res_sim = await client.post("/api/v1/simulate", json={"type": "NEW_LIABILITY", "parameters": {"principal": 1000000.0, "interest_rate": 8.5, "tenure_years": 5.0, "asset_purchase_value": 1000000.0}}, headers=headers_a)
        assert res_sim.status_code == 200
        assert "impact" in res_sim.json()

        # Save Decision Simulation record
        async with session_factory() as session:
            async with session.begin():
                await session.execute(sa.text("SELECT set_config('app.current_user_id', :uid, true);"), {"uid": str(tenant_a_id)})
                sim_record = DecisionSimulation(
                    id=uuid.uuid4(),
                    user_id=tenant_a_id,
                    scenario="CarPurchase",
                    recommendation="Proceed with 20% downpayment",
                    financial_impact="Reduces monthly surplus by 18,000",
                    risk_score=45
                )
                session.add(sim_record)
                await session.flush()
                sim_id_a = sim_record.id

        # ========================================================
        # 11. TWO-TENANT APPLICATION TEST (Tenant B setup & Isolation verification)
        # ========================================================
        # Tenant B creates Asset and Document
        res_asset_b = await client.post("/api/v1/assets", json={"asset_name": "Tenant B Gold Bars", "asset_type": "Gold", "current_value": 800000.0}, headers=headers_b)
        assert res_asset_b.status_code == 200
        asset_id_b = res_asset_b.json()["id"]
        assert res_asset_b.json()["user_id"] == str(tenant_b_id)

        files_b = {"file": ("tenant_b_salary.pdf", pdf_bytes, "application/pdf")}
        res_doc_b = await client.post("/api/v1/documents/upload", files=files_b, headers=headers_b)
        assert res_doc_b.status_code == 200
        doc_id_b = res_doc_b.json()["document_id"]

        # Tenant B creates Session
        res_sess_b = await client.post("/api/v1/chat/sessions", json={"title": "Tenant B Retirement Planning"}, headers=headers_b)
        assert res_sess_b.status_code == 200
        conv_id_b = res_sess_b.json()["id"]

        # Cross-Tenant READ Verifications:
        # Tenant A listing assets: ONLY Tenant A assets
        res_a_assets = await client.get("/api/v1/assets", headers=headers_a)
        assert res_a_assets.status_code == 200
        a_asset_ids = [a["id"] for a in res_a_assets.json()]
        assert asset_id in a_asset_ids
        assert asset_id_b not in a_asset_ids

        # Tenant B listing assets: ONLY Tenant B assets
        res_b_assets = await client.get("/api/v1/assets", headers=headers_b)
        assert res_b_assets.status_code == 200
        b_asset_ids = [a["id"] for a in res_b_assets.json()]
        assert asset_id_b in b_asset_ids
        assert asset_id not in b_asset_ids

        # Tenant A listing documents: ONLY Tenant A docs
        res_a_docs = await client.get("/api/v1/documents", headers=headers_a)
        assert doc_id_a in [d["id"] for d in res_a_docs.json()]
        assert doc_id_b not in [d["id"] for d in res_a_docs.json()]

        # Tenant B accessing Tenant A document detail -> 404 (Access denied / isolated)
        res_b_access_a_doc = await client.get(f"/api/v1/documents/{doc_id_a}", headers=headers_b)
        assert res_b_access_a_doc.status_code in [403, 404]

        # Tenant A accessing Tenant B chat session messages -> 404
        res_a_access_b_conv = await client.get(f"/api/v1/chat/sessions/{conv_id_b}/messages", headers=headers_a)
        assert res_a_access_b_conv.status_code in [403, 404]

        # ========================================================
        # 12. CLIENT user_id SPOOFING ATTACK
        # ========================================================
        # Tenant A sends a request containing user_id = Tenant B
        res_spoof = await client.post(
            "/api/v1/assets",
            json={
                "asset_name": "Spoofed Asset",
                "asset_type": "RealEstate",
                "current_value": 5000000.0,
                "user_id": str(tenant_b_id)  # Attacking payload
            },
            headers=headers_a
        )
        assert res_spoof.status_code == 200
        spoofed_asset = res_spoof.json()
        # Must be assigned to Tenant A, ignoring client user_id
        assert spoofed_asset["user_id"] == str(tenant_a_id)
        assert spoofed_asset["user_id"] != str(tenant_b_id)

    finally:
        # ========================================================
        # 15. CLEANUP SYNTHETIC TEST USERS
        # ========================================================
        async with session_factory() as session:
            async with session.begin():
                await session.execute(sa.text("RESET ROLE;"))
                await session.execute(sa.text("SELECT set_config('app.current_user_id', :uid, true);"), {"uid": str(tenant_a_id)})
                await session.execute(sa.text("DELETE FROM users WHERE id = :uid;"), {"uid": tenant_a_id})
                await session.execute(sa.text("SELECT set_config('app.current_user_id', :uid, true);"), {"uid": str(tenant_b_id)})
                await session.execute(sa.text("DELETE FROM users WHERE id = :uid;"), {"uid": tenant_b_id})
