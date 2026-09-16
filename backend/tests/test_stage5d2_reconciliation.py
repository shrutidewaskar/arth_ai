import pytest
import pytest_asyncio
import asyncio
import os
import re
import io
import uuid
import jwt
from datetime import datetime, timezone
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import letter
from httpx import AsyncClient, ASGITransport
from dotenv import dotenv_values
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy import text

env_path = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..', '.env.local'))
if not os.path.exists(env_path):
    env_path = os.path.abspath(os.path.join(os.getcwd(), '..', '.env.local'))
env = dotenv_values(env_path) if os.path.exists(env_path) else {}
raw_db_url = os.getenv('TEST_DATABASE_URL') or os.getenv('DATABASE_URL') or env.get('DATABASE_URL', '')
m = re.match(r'postgresql://([^:]+):(.*)@([^:/]+)(?::(\d+))?/(.*)', raw_db_url.strip('\"\''))
if m:
    _, password, _, _, dbname = m.groups()
    dbname = dbname or 'postgres'
    db_url = f'postgresql+asyncpg://postgres.qszgfpeqmkdqbjbacrol:{password}@aws-0-ap-southeast-1.pooler.supabase.com:5432/{dbname}'
else:
    db_url = 'postgresql+asyncpg://postgres:postgres@localhost:5432/postgres'

import sys
sys.path.append(os.path.join(os.path.dirname(__file__), '..'))

from app.main import app
from app.config import settings
from app.database import get_db

@pytest_asyncio.fixture
async def app_client():
    pg_engine = create_async_engine(db_url, echo=False)
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
    async with AsyncClient(transport=transport, base_url='http://testserver') as client:
        yield client, session_factory

    app.dependency_overrides.clear()
    await pg_engine.dispose()

def create_user_headers(user_id: uuid.UUID, email: str = None):
    email = email or f'user_{user_id.hex[:8]}@example.com'
    payload = {'sub': str(user_id), 'email': email, 'aud': 'authenticated', 'user_metadata': {'full_name': 'Test User'}}
    token = jwt.encode(payload, settings.JWT_SECRET, algorithm='HS256')
    return {'Authorization': f'Bearer {token}'}

async def cleanup_user(session_factory, user_id: uuid.UUID):
    async with session_factory() as session:
        async with session.begin():
            await session.execute(text('RESET ROLE;'))
            await session.execute(text(f"DELETE FROM users WHERE id = '{user_id}';"))

def create_mock_bank_statement_pdf(period: str = "01-04-2026 to 30-04-2026", start_date: str = "05-04-2026") -> bytes:
    buffer = io.BytesIO()
    c = canvas.Canvas(buffer, pagesize=letter)
    c.drawString(50, 750, "HDFC BANK STATEMENT OF ACCOUNT")
    c.drawString(50, 735, f"Statement Period: {period}")
    c.drawString(50, 720, "Account Number: 50100234567890")
    c.drawString(50, 700, "----------------------------------------------------------------------------------------------------")
    c.drawString(50, 680, f"{start_date} ACME TECH SALARY DIRECT CREDIT 85,000.00 CR 1,20,000.00")
    c.drawString(50, 660, "10-04-2026 HDFC LTD HOME LOAN EMI DEBIT 32,500.00 DR 1,10,000.00")
    c.drawString(50, 640, "15-04-2026 INTERNAL FUND TRANSFER TO OWN ACC 50,000.00 DR 60,000.00")
    c.drawString(50, 620, "20-04-2026 UNKNOWN UPI TRANSFER TO SHARMA 2,500.00 DR 57,500.00")
    c.drawString(50, 600, "----------------------------------------------------------------------------------------------------")
    c.save()
    buffer.seek(0)
    return buffer.getvalue()

def create_mock_loan_statement_pdf(lender: str = "HDFC LTD", outstanding: str = "18,40,000.00", emi: str = "32,500.00", principal: str = "25,00,000.00") -> bytes:
    buffer = io.BytesIO()
    c = canvas.Canvas(buffer, pagesize=letter)
    c.drawString(50, 750, f"{lender} HOME LOAN STATEMENT")
    c.drawString(50, 735, "Loan Account No: 6140098234")
    c.drawString(50, 720, f"Sanctioned Loan Amount: {principal}")
    c.drawString(50, 705, f"Principal Outstanding: {outstanding}")
    c.drawString(50, 690, "Rate of Interest: 8.50 %")
    c.drawString(50, 675, f"Monthly Installment: {emi}")
    c.drawString(50, 660, "Tenure: 180 months")
    c.save()
    buffer.seek(0)
    return buffer.getvalue()

def create_mock_salary_slip_pdf(employer: str = "Acme Technologies", net_pay: str = "85,000.00") -> bytes:
    buffer = io.BytesIO()
    c = canvas.Canvas(buffer, pagesize=letter)
    c.drawString(50, 750, f"{employer} PAYSLIP FOR APRIL 2026")
    c.drawString(50, 735, "Employee Name: Rajesh Sharma")
    c.drawString(50, 720, "Employee ID: ACM-9021")
    c.drawString(50, 705, "Basic Salary: 50,000.00")
    c.drawString(50, 690, "HRA: 25,000.00")
    c.drawString(50, 675, "Special Allowance: 20,000.00")
    c.drawString(50, 660, "Gross Earnings: 95,000.00")
    c.drawString(50, 645, "Provident Fund: 6,000.00")
    c.drawString(50, 630, "Professional Tax: 200.00")
    c.drawString(50, 615, "Income Tax (TDS): 3,800.00")
    c.drawString(50, 600, "Total Deductions: 10,000.00")
    c.drawString(50, 580, f"Net Pay: {net_pay}")
    c.save()
    buffer.seek(0)
    return buffer.getvalue()


# ============================================================================
# STAGE 5D.2 RECONCILIATION & CONFLICT RESOLUTION TESTS
# ============================================================================

@pytest.mark.asyncio
async def test_1_ambiguous_transaction_not_blindly_classified_as_expense(app_client):
    """
    TEST 1: Ambiguity & Semantic Normalizer
    Internal account transfers (Own account) and untagged UPI transfers are classified
    as TRANSFER or NEEDS_REVIEW, avoiding false EXPENSE inflation.
    """
    client, session_factory = app_client
    user_id = uuid.uuid4()
    headers = create_user_headers(user_id)

    try:
        pdf_bytes = create_mock_bank_statement_pdf()
        files = {'file': ('HDFC_Statement.pdf', pdf_bytes, 'application/pdf')}
        res = await client.post('/api/v1/documents/upload', files=files, headers=headers)
        assert res.status_code == 200

        cand_res = await client.get('/api/v1/ingestion/candidates', headers=headers)
        candidates = cand_res.json()['candidates']

        # Find the self transfer and UPI transfer candidates
        self_trf = next((c for c in candidates if "OWN ACC" in c['provenance']['raw_description']), None)
        assert self_trf is not None
        assert self_trf['candidate_type'] == "TRANSFER"

        unknown_upi = next((c for c in candidates if "UNKNOWN UPI" in c['provenance']['raw_description']), None)
        assert unknown_upi is not None
        assert unknown_upi['candidate_type'] == "NEEDS_REVIEW"
        assert unknown_upi['confidence'] is None # Explicitly unknown confidence
    finally:
        await cleanup_user(session_factory, user_id)


@pytest.mark.asyncio
async def test_2_entity_reconciliation_loan_statement_and_bank_statement(app_client):
    """
    TEST 2: Entity Reconciliation
    Ingesting both a Loan Statement (giving ₹18.4L outstanding, 8.5% rate) and a Bank Statement
    (containing ₹32,500 monthly EMI) resolves into ONE coherent canonical liability.
    """
    client, session_factory = app_client
    user_id = uuid.uuid4()
    headers = create_user_headers(user_id)

    try:
        # Ingest Loan Statement first
        loan_pdf = create_mock_loan_statement_pdf(lender="HDFC LTD", outstanding="18,40,000.00", emi="32,500.00")
        await client.post('/api/v1/documents/upload', files={'file': ('HDFC_Loan_Statement.pdf', loan_pdf, 'application/pdf')}, headers=headers)

        cands = (await client.get('/api/v1/ingestion/candidates', headers=headers)).json()['candidates']
        loan_cand = next(c for c in cands if c['candidate_type'] == 'LIABILITY')
        # Approve loan candidate
        await client.post(f'/api/v1/ingestion/candidates/{loan_cand["id"]}/approve', headers=headers)

        # Ingest Bank Statement containing HDFC EMI debit
        bank_pdf = create_mock_bank_statement_pdf()
        await client.post('/api/v1/documents/upload', files={'file': ('Bank_Statement.pdf', bank_pdf, 'application/pdf')}, headers=headers)

        # Check canonical liabilities: exactly ONE liability with correct terms
        liabs_res = await client.get('/api/v1/liabilities', headers=headers)
        liabs = liabs_res.json()
        assert len(liabs) == 1
        assert float(liabs[0]['outstanding']) == 1840000.0
        assert float(liabs[0]['interest_rate']) == 8.5
        assert float(liabs[0]['emi']) == 32500.0
    finally:
        await cleanup_user(session_factory, user_id)


@pytest.mark.asyncio
async def test_3_manual_salary_vs_multi_document_conflict_detection(app_client):
    """
    TEST 3: Conflict Detection & Corroboration Surfacing
    User enters ₹80,000 salary manually.
    Then uploads Salary Slip (₹85,000) and Bank Statement (₹85,000).
    System detects conflict, lists 2 independent corroborating sources, and keeps canonical state unchanged
    until explicit resolution.
    """
    client, session_factory = app_client
    user_id = uuid.uuid4()
    headers = create_user_headers(user_id)

    try:
        # 1. Manual entry: ₹80,000
        await client.post('/api/v1/incomes', json={'source_name': 'Acme Salary', 'amount': 80000.0, 'type': 'Salary'}, headers=headers)

        # 2. Upload Document 1: Salary Slip ₹85,000
        slip_pdf = create_mock_salary_slip_pdf(employer="Acme Technologies", net_pay="85,000.00")
        await client.post('/api/v1/documents/upload', files={'file': ('Salary_Slip_April.pdf', slip_pdf, 'application/pdf')}, headers=headers)

        # 3. Upload Document 2: Bank Statement ₹85,000 credit
        bank_pdf = create_mock_bank_statement_pdf()
        await client.post('/api/v1/documents/upload', files={'file': ('Bank_Statement_April.pdf', bank_pdf, 'application/pdf')}, headers=headers)

        # 4. Fetch conflicts
        conflicts_res = await client.get('/api/v1/ingestion/conflicts', headers=headers)
        assert conflicts_res.status_code == 200
        conflicts = conflicts_res.json()['conflicts']
        assert len(conflicts) > 0

        salary_conflict = next(c for c in conflicts if c['candidate_type'] == 'INCOME')
        assert salary_conflict['canonical_value'] == 80000.0
        assert salary_conflict['suggested_value'] == 85000.0
        assert len(salary_conflict['corroborating_sources']) == 2
        assert "Salary_Slip_April.pdf" in salary_conflict['corroborating_sources']
        assert "Bank_Statement_April.pdf" in salary_conflict['corroborating_sources']

        # 5. Verify canonical state is NOT prematurely overwritten
        incomes_res = await client.get('/api/v1/incomes', headers=headers)
        assert float(incomes_res.json()[0]['amount']) == 80000.0

        # 6. Resolve conflict: ACCEPT_SUGGESTED
        resolve_res = await client.post(
            f'/api/v1/ingestion/conflicts/{salary_conflict["candidate_id"]}/resolve',
            json={'decision': 'ACCEPT_SUGGESTED'},
            headers=headers
        )
        assert resolve_res.status_code == 200

        # 7. Canonical state updated to ₹85,000
        incomes_updated = await client.get('/api/v1/incomes', headers=headers)
        assert float(incomes_updated.json()[0]['amount']) == 85000.0
    finally:
        await cleanup_user(session_factory, user_id)


@pytest.mark.asyncio
async def test_4_temporal_liability_tracking(app_client):
    """
    TEST 4: Temporal Observation Tracking
    Ingesting an April loan statement (₹18.7L) and subsequently a May loan statement (₹18.4L)
    updates the single canonical liability's balance to ₹18.4L rather than creating a second liability.
    """
    client, session_factory = app_client
    user_id = uuid.uuid4()
    headers = create_user_headers(user_id)

    try:
        # April Statement: ₹18.7L outstanding
        apr_pdf = create_mock_loan_statement_pdf(lender="HDFC LTD", outstanding="18,70,000.00", emi="32,500.00")
        await client.post('/api/v1/documents/upload', files={'file': ('HDFC_Loan_April.pdf', apr_pdf, 'application/pdf')}, headers=headers)
        cands1 = (await client.get('/api/v1/ingestion/candidates', headers=headers)).json()['candidates']
        cand_apr = next(c for c in cands1 if c['candidate_type'] == 'LIABILITY')
        await client.post(f'/api/v1/ingestion/candidates/{cand_apr["id"]}/approve', headers=headers)

        liabs_apr = (await client.get('/api/v1/liabilities', headers=headers)).json()
        assert len(liabs_apr) == 1
        assert float(liabs_apr[0]['outstanding']) == 1870000.0

        # May Statement: ₹18.4L outstanding
        may_pdf = create_mock_loan_statement_pdf(lender="HDFC LTD", outstanding="18,40,000.00", emi="32,500.00")
        await client.post('/api/v1/documents/upload', files={'file': ('HDFC_Loan_May.pdf', may_pdf, 'application/pdf')}, headers=headers)
        cands2 = (await client.get('/api/v1/ingestion/candidates', headers=headers)).json()['candidates']
        cand_may = next(c for c in cands2 if c['candidate_type'] == 'LIABILITY' and c['status'] == 'PENDING_REVIEW')
        
        # Approve May candidate -> reconciles and updates existing liability
        await client.post(f'/api/v1/ingestion/candidates/{cand_may["id"]}/approve', headers=headers)

        liabs_may = (await client.get('/api/v1/liabilities', headers=headers)).json()
        assert len(liabs_may) == 1 # Still 1 liability
        assert float(liabs_may[0]['outstanding']) == 1840000.0 # Balance updated to latest temporal observation
    finally:
        await cleanup_user(session_factory, user_id)


@pytest.mark.asyncio
async def test_5_reconciliation_conflict_custom_resolution(app_client):
    """
    TEST 5: Custom Conflict Resolution
    User can provide a custom amount when resolving a conflict (e.g. ₹82,500).
    """
    client, session_factory = app_client
    user_id = uuid.uuid4()
    headers = create_user_headers(user_id)

    try:
        await client.post('/api/v1/incomes', json={'source_name': 'Acme Salary', 'amount': 80000.0, 'type': 'Salary'}, headers=headers)
        slip_pdf = create_mock_salary_slip_pdf(net_pay="85,000.00")
        await client.post('/api/v1/documents/upload', files={'file': ('Salary_Slip.pdf', slip_pdf, 'application/pdf')}, headers=headers)

        conflicts = (await client.get('/api/v1/ingestion/conflicts', headers=headers)).json()['conflicts']
        salary_conflict = conflicts[0]

        # Resolve with CUSTOM value: ₹82,500
        await client.post(
            f'/api/v1/ingestion/conflicts/{salary_conflict["candidate_id"]}/resolve',
            json={'decision': 'CUSTOM', 'custom_value': 82500.0},
            headers=headers
        )

        incomes = (await client.get('/api/v1/incomes', headers=headers)).json()
        assert float(incomes[0]['amount']) == 82500.0
    finally:
        await cleanup_user(session_factory, user_id)


@pytest.mark.asyncio
async def test_6_cross_tenant_conflict_isolation(app_client):
    """
    TEST 6: Tenant Isolation on Conflicts
    Tenant A's conflicts and candidates are invisible and unresolvable by Tenant B.
    """
    client, session_factory = app_client
    user_a = uuid.uuid4()
    user_b = uuid.uuid4()
    headers_a = create_user_headers(user_a)
    headers_b = create_user_headers(user_b)

    try:
        await client.post('/api/v1/incomes', json={'source_name': 'Acme Salary', 'amount': 80000.0}, headers=headers_a)
        slip_pdf = create_mock_salary_slip_pdf(net_pay="85,000.00")
        await client.post('/api/v1/documents/upload', files={'file': ('SlipA.pdf', slip_pdf, 'application/pdf')}, headers=headers_a)

        conflicts_a = (await client.get('/api/v1/ingestion/conflicts', headers=headers_a)).json()['conflicts']
        assert len(conflicts_a) == 1
        cand_a_id = conflicts_a[0]['candidate_id']

        # Tenant B cannot see Tenant A's conflicts
        conflicts_b = (await client.get('/api/v1/ingestion/conflicts', headers=headers_b)).json()['conflicts']
        assert len(conflicts_b) == 0

        # Tenant B cannot resolve Tenant A's conflict
        res_b = await client.post(
            f'/api/v1/ingestion/conflicts/{cand_a_id}/resolve',
            json={'decision': 'ACCEPT_SUGGESTED'},
            headers=headers_b
        )
        assert res_b.status_code == 404
    finally:
        await cleanup_user(session_factory, user_a)
        await cleanup_user(session_factory, user_b)
