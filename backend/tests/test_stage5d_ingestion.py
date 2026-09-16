import asyncio
import os
import io
import re
import uuid
import jwt
import pytest
import pytest_asyncio
from httpx import AsyncClient, ASGITransport
from dotenv import dotenv_values
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy import text
from reportlab.lib.pagesizes import letter
from reportlab.pdfgen import canvas

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
    c.drawString(50, 680, f"{start_date} ACME TECH SALARY DIRECT CREDIT 80,000.00 CR 1,20,000.00")
    c.drawString(50, 660, "10-04-2026 HDFC LTD HOME LOAN EMI DEBIT 10,000.00 DR 1,10,000.00")
    c.drawString(50, 640, "15-04-2026 SWIGGY INSTAMART GROCERIES 1,200.00 DR 1,08,800.00")
    c.drawString(50, 620, "20-04-2026 NETFLIX SUBSCRIPTION 649.00 DR 1,08,151.00")
    c.drawString(50, 600, "25-04-2026 GROWW MUTUAL FUND SIP 5,000.00 DR 1,03,151.00")
    c.drawString(50, 580, "28-04-2026 HOUSE RENT PAYMENT 20,000.00 DR 83,151.00")
    c.drawString(50, 560, "----------------------------------------------------------------------------------------------------")
    c.drawString(50, 540, "Total Deposits / Credits: 80,000.00 Total Withdrawals / Debits: 36,849.00")
    c.save()
    buffer.seek(0)
    return buffer.getvalue()

def create_mock_loan_statement_pdf(lender: str = "HDFC LTD", outstanding: str = "42,00,000.00", emi: str = "32,500.00") -> bytes:
    buffer = io.BytesIO()
    c = canvas.Canvas(buffer, pagesize=letter)
    c.drawString(50, 750, f"{lender} HOME LOAN STATEMENT")
    c.drawString(50, 735, "Loan Account No: 6140098234")
    c.drawString(50, 720, "Sanctioned Loan Amount: 45,00,000.00")
    c.drawString(50, 705, f"Principal Outstanding: {outstanding}")
    c.drawString(50, 690, "Rate of Interest: 8.50 %")
    c.drawString(50, 675, f"Monthly Installment: {emi}")
    c.drawString(50, 660, "Tenure: 240 months")
    c.save()
    buffer.seek(0)
    return buffer.getvalue()

def create_empty_pdf() -> bytes:
    buffer = io.BytesIO()
    c = canvas.Canvas(buffer, pagesize=letter)
    c.showPage() # empty page
    c.save()
    buffer.seek(0)
    return buffer.getvalue()

# ============================================================================
# 1. BASELINE FLOWS (1 to 4)
# ============================================================================

@pytest.mark.asyncio
async def test_1_bank_statement_ingestion_and_human_review(app_client):
    client, session_factory = app_client
    user_id = uuid.uuid4()
    headers = create_user_headers(user_id)
    
    try:
        await client.put('/api/v1/profile', json={'age': 30, 'city': 'Pune'}, headers=headers)
        
        pdf_bytes = create_mock_bank_statement_pdf()
        files = {'file': ('HDFC_Bank_Statement.pdf', pdf_bytes, 'application/pdf')}
        upload_res = await client.post('/api/v1/documents/upload', files=files, headers=headers)
        assert upload_res.status_code == 200
        doc_data = upload_res.json()
        assert doc_data['status'] == 'PROCESSED'
        assert doc_data['document_type'] == 'BANK_STATEMENT'
        
        cand_res = await client.get('/api/v1/ingestion/candidates', headers=headers)
        assert cand_res.status_code == 200
        cand_data = cand_res.json()
        assert cand_data['total_count'] >= 5
        
        candidates = cand_data['candidates']
        salary_cand = next((c for c in candidates if c['candidate_type'] == 'INCOME'), None)
        assert salary_cand is not None
        assert salary_cand['suggested_data']['amount'] == 80000.0
        assert salary_cand['status'] == 'PENDING_REVIEW'
        
        # Read-only check before approval
        incomes_res = await client.get('/api/v1/incomes', headers=headers)
        assert len(incomes_res.json()) == 0
        
        # Approve salary
        appr_inc = await client.post(f'/api/v1/ingestion/candidates/{salary_cand["id"]}/approve', headers=headers)
        assert appr_inc.status_code == 200
        assert appr_inc.json()['status'] == 'APPROVED'
        
        incomes_after = await client.get('/api/v1/incomes', headers=headers)
        assert len(incomes_after.json()) == 1
        assert float(incomes_after.json()[0]['amount']) == 80000.0
    finally:
        await cleanup_user(session_factory, user_id)

@pytest.mark.asyncio
async def test_2_candidate_edit_and_reject_flow(app_client):
    client, session_factory = app_client
    user_id = uuid.uuid4()
    headers = create_user_headers(user_id)
    
    try:
        await client.put('/api/v1/profile', json={'age': 28, 'city': 'Mumbai'}, headers=headers)
        pdf_bytes = create_mock_bank_statement_pdf()
        files = {'file': ('Statement.pdf', pdf_bytes, 'application/pdf')}
        await client.post('/api/v1/documents/upload', files=files, headers=headers)
        
        cand_res = await client.get('/api/v1/ingestion/candidates', headers=headers)
        candidates = cand_res.json()['candidates']
        
        sub_cand = next((c for c in candidates if c['candidate_type'] == 'SUBSCRIPTION'), None)
        assert sub_cand is not None
        
        # 1. Reject subscription
        rej_res = await client.post(f'/api/v1/ingestion/candidates/{sub_cand["id"]}/reject', headers=headers)
        assert rej_res.status_code == 200
        assert rej_res.json()['status'] == 'REJECTED'
        
        subs_res = await client.get('/api/v1/subscriptions', headers=headers)
        assert len(subs_res.json()) == 0
        
        # 2. Edit salary candidate amount to 90k
        salary_cand = next((c for c in candidates if c['candidate_type'] == 'INCOME'), None)
        edit_res = await client.post(
            f'/api/v1/ingestion/candidates/{salary_cand["id"]}/edit',
            json={'edited_data': {'source_name': 'Acme Tech Promoted', 'type': 'Salary', 'amount': 90000.0}},
            headers=headers
        )
        assert edit_res.status_code == 200
        assert edit_res.json()['status'] == 'EDITED'
        
        incomes_res = await client.get('/api/v1/incomes', headers=headers)
        assert len(incomes_res.json()) == 1
        assert float(incomes_res.json()[0]['amount']) == 90000.0
    finally:
        await cleanup_user(session_factory, user_id)

@pytest.mark.asyncio
async def test_3_loan_statement_ingestion_and_pulse_dti(app_client):
    client, session_factory = app_client
    user_id = uuid.uuid4()
    headers = create_user_headers(user_id)
    
    try:
        await client.put('/api/v1/profile', json={'age': 32, 'city': 'Delhi'}, headers=headers)
        await client.post('/api/v1/incomes', json={'source_name': 'Salary', 'amount': 100000.0}, headers=headers)
        
        pdf_bytes = create_mock_loan_statement_pdf()
        files = {'file': ('HDFC_Home_Loan_Statement.pdf', pdf_bytes, 'application/pdf')}
        upload_res = await client.post('/api/v1/documents/upload', files=files, headers=headers)
        assert upload_res.status_code == 200
        assert upload_res.json()['document_type'] == 'LOAN_STATEMENT'
        
        cand_res = await client.get('/api/v1/ingestion/candidates', headers=headers)
        loan_cand = next((c for c in cand_res.json()['candidates'] if c['candidate_type'] == 'LIABILITY'), None)
        assert loan_cand is not None
        assert loan_cand['suggested_data']['outstanding'] == 4200000.0
        
        appr_res = await client.post(f'/api/v1/ingestion/candidates/{loan_cand["id"]}/approve', headers=headers)
        assert appr_res.status_code == 200
        
        pulse_res = await client.get('/api/v1/financial-pulse', headers=headers)
        pulse = pulse_res.json()['pulse']
        assert pulse['dti_ratio_pct'] > 0
    finally:
        await cleanup_user(session_factory, user_id)

@pytest.mark.asyncio
async def test_4_tenant_isolation_on_candidates(app_client):
    client, session_factory = app_client
    user_a = uuid.uuid4()
    user_b = uuid.uuid4()
    headers_a = create_user_headers(user_a)
    headers_b = create_user_headers(user_b)
    
    try:
        pdf_bytes = create_mock_bank_statement_pdf()
        files = {'file': ('StatementA.pdf', pdf_bytes, 'application/pdf')}
        await client.post('/api/v1/documents/upload', files=files, headers=headers_a)
        
        res_a = await client.get('/api/v1/ingestion/candidates', headers=headers_a)
        cand_a_id = res_a.json()['candidates'][0]['id']
        
        # Tenant B cannot see or approve Tenant A's candidate
        res_b = await client.get('/api/v1/ingestion/candidates', headers=headers_b)
        assert len(res_b.json()['candidates']) == 0
        
        appr_b = await client.post(f'/api/v1/ingestion/candidates/{cand_a_id}/approve', headers=headers_b)
        assert appr_b.status_code == 404
    finally:
        await cleanup_user(session_factory, user_a)
        await cleanup_user(session_factory, user_b)

# ============================================================================
# 2. STAGE 5D.1 INTEGRITY & HARDENING TESTS (5 to 16)
# ============================================================================

@pytest.mark.asyncio
async def test_5_confidence_never_defaults_to_false_certainty(app_client):
    """
    TEST 5 — Confidence Semantics:
    Verify that unclassified / generic documents do NOT assign a false 1.00 certainty default.
    """
    client, session_factory = app_client
    user_id = uuid.uuid4()
    headers = create_user_headers(user_id)
    
    try:
        # Create PDF with unclassifiable text
        buffer = io.BytesIO()
        c = canvas.Canvas(buffer, pagesize=letter)
        c.drawString(100, 700, "Generic letter without financial keywords or numbers.")
        c.save()
        buffer.seek(0)
        
        files = {'file': ('Generic_Letter.pdf', buffer.getvalue(), 'application/pdf')}
        res = await client.post('/api/v1/documents/upload', files=files, headers=headers)
        assert res.status_code == 200
        assert res.json()['document_type'] == 'OTHER'
        
        # Verify 0 false candidates staged with false certainty
        cand_res = await client.get('/api/v1/ingestion/candidates', headers=headers)
        assert cand_res.json()['total_count'] == 0
    finally:
        await cleanup_user(session_factory, user_id)

@pytest.mark.asyncio
async def test_6_provenance_survives_approval(app_client):
    """
    TEST 6 — Provenance Retention:
    Verify that after approval, canonical entity ID is linked back to candidate with full provenance metadata.
    """
    client, session_factory = app_client
    user_id = uuid.uuid4()
    headers = create_user_headers(user_id)
    
    try:
        pdf_bytes = create_mock_loan_statement_pdf()
        files = {'file': ('HDFC_Loan.pdf', pdf_bytes, 'application/pdf')}
        await client.post('/api/v1/documents/upload', files=files, headers=headers)
        
        cands = (await client.get('/api/v1/ingestion/candidates', headers=headers)).json()['candidates']
        loan_cand = cands[0]
        
        # Approve candidate
        appr_res = await client.post(f'/api/v1/ingestion/candidates/{loan_cand["id"]}/approve', headers=headers)
        appr_data = appr_res.json()
        assert appr_data['status'] == 'APPROVED'
        assert appr_data['canonical_entity_id'] is not None
        
        # Verify provenance is retained
        prov = appr_data['provenance']
        assert prov['file_name'] == 'HDFC_Loan.pdf'
        assert 'document_id' in prov
        assert prov['extraction_method'] == 'deterministic_regex_rule'
    finally:
        await cleanup_user(session_factory, user_id)

@pytest.mark.asyncio
async def test_7_duplicate_document_upload_safety(app_client):
    """
    TEST 7 — Duplicate Document Upload:
    Uploading identical file twice does NOT double candidate entities or canonical state.
    """
    client, session_factory = app_client
    user_id = uuid.uuid4()
    headers = create_user_headers(user_id)
    
    try:
        pdf_bytes = create_mock_loan_statement_pdf()
        
        # Upload 1
        files1 = {'file': ('HDFC_Loan_1.pdf', pdf_bytes, 'application/pdf')}
        await client.post('/api/v1/documents/upload', files=files1, headers=headers)
        
        # Upload 2 (identical content)
        files2 = {'file': ('HDFC_Loan_2.pdf', pdf_bytes, 'application/pdf')}
        await client.post('/api/v1/documents/upload', files=files2, headers=headers)
        
        # Verify only 1 liability candidate staged (deduplication applied)
        cand_res = await client.get('/api/v1/ingestion/candidates', headers=headers)
        liab_cands = [c for c in cand_res.json()['candidates'] if c['candidate_type'] == 'LIABILITY']
        assert len(liab_cands) == 1
    finally:
        await cleanup_user(session_factory, user_id)

@pytest.mark.asyncio
async def test_8_duplicate_transaction_deduplication(app_client):
    """
    TEST 8 — Overlapping Statement Deduplication:
    Uploading overlapping statement months does NOT duplicate identical transactions.
    """
    client, session_factory = app_client
    user_id = uuid.uuid4()
    headers = create_user_headers(user_id)
    
    try:
        pdf_bytes1 = create_mock_bank_statement_pdf(period="01-04-2026 to 30-04-2026")
        pdf_bytes2 = create_mock_bank_statement_pdf(period="01-04-2026 to 31-05-2026") # Overlaps April
        
        files1 = {'file': ('Statement_April.pdf', pdf_bytes1, 'application/pdf')}
        await client.post('/api/v1/documents/upload', files=files1, headers=headers)
        count_1 = (await client.get('/api/v1/ingestion/candidates', headers=headers)).json()['total_count']
        
        files2 = {'file': ('Statement_April_May.pdf', pdf_bytes2, 'application/pdf')}
        await client.post('/api/v1/documents/upload', files=files2, headers=headers)
        count_2 = (await client.get('/api/v1/ingestion/candidates', headers=headers)).json()['total_count']
        
        # Count should remain same because all April transactions were already staged
        assert count_2 == count_1
    finally:
        await cleanup_user(session_factory, user_id)

@pytest.mark.asyncio
async def test_9_duplicate_liability_between_loan_and_bank_statement(app_client):
    """
    TEST 9 — Loan Statement + Bank Statement Deduplication:
    When a formal loan statement is already ingested, a bank statement EMI does not create a duplicate liability.
    """
    client, session_factory = app_client
    user_id = uuid.uuid4()
    headers = create_user_headers(user_id)
    
    try:
        # Ingest Loan Statement first
        loan_pdf = create_mock_loan_statement_pdf(lender="HDFC", emi="10,000.00")
        files_loan = {'file': ('HDFC_Loan_Statement.pdf', loan_pdf, 'application/pdf')}
        await client.post('/api/v1/documents/upload', files=files_loan, headers=headers)
        
        # Ingest Bank Statement containing HDFC EMI debit
        bank_pdf = create_mock_bank_statement_pdf()
        files_bank = {'file': ('Bank_Statement.pdf', bank_pdf, 'application/pdf')}
        await client.post('/api/v1/documents/upload', files=files_bank, headers=headers)
        
        cands = (await client.get('/api/v1/ingestion/candidates', headers=headers)).json()['candidates']
        liab_cands = [c for c in cands if c['candidate_type'] == 'LIABILITY']
        # Should only have the formal Loan Statement liability candidate
        assert len(liab_cands) == 1
        assert liab_cands[0]['provenance']['file_name'] == 'HDFC_Loan_Statement.pdf'
    finally:
        await cleanup_user(session_factory, user_id)

@pytest.mark.asyncio
async def test_10_transaction_not_automatically_expense(app_client):
    """
    TEST 10 — Transaction Semantic Distinction:
    Salary credits are marked INCOME, SIPs are marked INVESTMENT, OTTs are marked SUBSCRIPTION, not generic expenses.
    """
    client, session_factory = app_client
    user_id = uuid.uuid4()
    headers = create_user_headers(user_id)
    
    try:
        pdf_bytes = create_mock_bank_statement_pdf()
        files = {'file': ('Statement.pdf', pdf_bytes, 'application/pdf')}
        await client.post('/api/v1/documents/upload', files=files, headers=headers)
        
        cands = (await client.get('/api/v1/ingestion/candidates', headers=headers)).json()['candidates']
        
        types = {c['candidate_type'] for c in cands}
        assert 'INCOME' in types # Salary
        assert 'SUBSCRIPTION' in types # Netflix
        assert 'INVESTMENT' in types # Groww SIP
        assert 'EXPENSE' in types # Food/Rent
    finally:
        await cleanup_user(session_factory, user_id)

@pytest.mark.asyncio
async def test_11_manual_data_conflict_safety(app_client):
    """
    TEST 11 — Manual vs Document Safety:
    Document ingestion does NOT overwrite manual salary until explicit user approval.
    """
    client, session_factory = app_client
    user_id = uuid.uuid4()
    headers = create_user_headers(user_id)
    
    try:
        # 1. User enters manual salary Rs. 80,000
        await client.post('/api/v1/incomes', json={'source_name': 'Acme Tech', 'amount': 80000.0}, headers=headers)
        
        # 2. Upload document showing Rs. 95,000
        buffer = io.BytesIO()
        c = canvas.Canvas(buffer, pagesize=letter)
        c.drawString(50, 750, "PAYSLIP FOR APRIL 2026")
        c.drawString(50, 735, "Employer: Acme Tech")
        c.drawString(50, 720, "Gross Salary: 105000.00")
        c.drawString(50, 705, "Net Salary: 95000.00")
        c.save()
        buffer.seek(0)
        
        files = {'file': ('SalarySlip.pdf', buffer.getvalue(), 'application/pdf')}
        await client.post('/api/v1/documents/upload', files=files, headers=headers)
        
        # 3. Canonical state is STILL Rs. 80,000 before review
        inc_res = await client.get('/api/v1/incomes', headers=headers)
        assert float(inc_res.json()[0]['amount']) == 80000.0
    finally:
        await cleanup_user(session_factory, user_id)

@pytest.mark.asyncio
async def test_12_empty_and_malformed_document_safety(app_client):
    """
    TEST 12 — Empty and Malformed Documents:
    Empty/corrupt files do not produce fake candidates or crash.
    """
    client, session_factory = app_client
    user_id = uuid.uuid4()
    headers = create_user_headers(user_id)
    
    try:
        # Empty PDF
        empty_pdf = create_empty_pdf()
        files_empty = {'file': ('Empty.pdf', empty_pdf, 'application/pdf')}
        res_empty = await client.post('/api/v1/documents/upload', files=files_empty, headers=headers)
        assert res_empty.status_code == 200
        
        # Non-PDF rejection
        files_invalid = {'file': ('Test.txt', b'not a pdf', 'text/plain')}
        res_invalid = await client.post('/api/v1/documents/upload', files=files_invalid, headers=headers)
        assert res_invalid.status_code == 400
    finally:
        await cleanup_user(session_factory, user_id)

@pytest.mark.asyncio
async def test_13_candidate_edit_validation(app_client):
    """
    TEST 13 — Candidate Edit Validation:
    Reject negative amounts or malformed inputs on candidate edit.
    """
    client, session_factory = app_client
    user_id = uuid.uuid4()
    headers = create_user_headers(user_id)
    
    try:
        pdf_bytes = create_mock_bank_statement_pdf()
        files = {'file': ('Statement.pdf', pdf_bytes, 'application/pdf')}
        await client.post('/api/v1/documents/upload', files=files, headers=headers)
        
        cands = (await client.get('/api/v1/ingestion/candidates', headers=headers)).json()['candidates']
        cand_id = cands[0]['id']
        
        # Attempt negative amount
        edit_res = await client.post(
            f'/api/v1/ingestion/candidates/{cand_id}/edit',
            json={'edited_data': {'amount': -5000.0}},
            headers=headers
        )
        assert edit_res.status_code == 400
    finally:
        await cleanup_user(session_factory, user_id)

@pytest.mark.asyncio
async def test_14_approval_idempotency(app_client):
    """
    TEST 14 — Approval Idempotency:
    Approving the same candidate twice does not create duplicate canonical rows.
    """
    client, session_factory = app_client
    user_id = uuid.uuid4()
    headers = create_user_headers(user_id)
    
    try:
        pdf_bytes = create_mock_bank_statement_pdf()
        files = {'file': ('Statement.pdf', pdf_bytes, 'application/pdf')}
        await client.post('/api/v1/documents/upload', files=files, headers=headers)
        
        cands = (await client.get('/api/v1/ingestion/candidates', headers=headers)).json()['candidates']
        salary_cand = next(c for c in cands if c['candidate_type'] == 'INCOME')
        
        # Approve 1st time
        res1 = await client.post(f'/api/v1/ingestion/candidates/{salary_cand["id"]}/approve', headers=headers)
        assert res1.status_code == 200
        
        # Approve 2nd time
        res2 = await client.post(f'/api/v1/ingestion/candidates/{salary_cand["id"]}/approve', headers=headers)
        assert res2.status_code == 200
        
        # Exactly 1 row in incomes
        incomes = (await client.get('/api/v1/incomes', headers=headers)).json()
        assert len(incomes) == 1
    finally:
        await cleanup_user(session_factory, user_id)

@pytest.mark.asyncio
async def test_15_rejection_safety_and_transition(app_client):
    """
    TEST 15 — Rejection Safety:
    A rejected candidate cannot be approved without a valid reset.
    """
    client, session_factory = app_client
    user_id = uuid.uuid4()
    headers = create_user_headers(user_id)
    
    try:
        pdf_bytes = create_mock_bank_statement_pdf()
        files = {'file': ('Statement.pdf', pdf_bytes, 'application/pdf')}
        await client.post('/api/v1/documents/upload', files=files, headers=headers)
        
        cands = (await client.get('/api/v1/ingestion/candidates', headers=headers)).json()['candidates']
        cand = cands[0]
        
        # Reject candidate
        rej_res = await client.post(f'/api/v1/ingestion/candidates/{cand["id"]}/reject', headers=headers)
        assert rej_res.status_code == 200
        assert rej_res.json()['status'] == 'REJECTED'
        
        # Attempt to approve rejected candidate -> fails with 400
        appr_res = await client.post(f'/api/v1/ingestion/candidates/{cand["id"]}/approve', headers=headers)
        assert appr_res.status_code == 400
    finally:
        await cleanup_user(session_factory, user_id)

@pytest.mark.asyncio
async def test_16_upload_does_not_bypass_financial_state_boundary(app_client):
    """
    TEST 16 — Financial Pulse Boundary:
    Uploading a document leaves Financial Pulse completely untouched until human approval.
    """
    client, session_factory = app_client
    user_id = uuid.uuid4()
    headers = create_user_headers(user_id)
    
    try:
        await client.put('/api/v1/profile', json={'age': 30, 'city': 'Bangalore'}, headers=headers)
        
        # Pulse before upload
        pulse_before = (await client.get('/api/v1/financial-pulse', headers=headers)).json()['pulse']
        assert pulse_before['monthly_income'] == 0.0
        assert pulse_before['monthly_expenses'] == 0.0
        
        # Upload statement
        pdf_bytes = create_mock_bank_statement_pdf()
        files = {'file': ('Statement.pdf', pdf_bytes, 'application/pdf')}
        await client.post('/api/v1/documents/upload', files=files, headers=headers)
        
        # Pulse after upload (STILL 0.0)
        pulse_after = (await client.get('/api/v1/financial-pulse', headers=headers)).json()['pulse']
        assert pulse_after['monthly_income'] == 0.0
        assert pulse_after['monthly_expenses'] == 0.0
        assert pulse_after['health_score'] == pulse_before['health_score']
    finally:
        await cleanup_user(session_factory, user_id)
