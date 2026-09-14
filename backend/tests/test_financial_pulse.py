import asyncio
import os
import re
import uuid
import jwt
import pytest
import pytest_asyncio
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

@pytest.mark.asyncio
async def test_1_empty_user(app_client):
    """TEST 1 — Empty user: no fabricated financial risk, incomplete state, data-quality attention only."""
    client, session_factory = app_client
    user_id = uuid.uuid4()
    headers = create_user_headers(user_id)
    try:
        res_pulse = await client.get('/api/v1/financial-pulse', headers=headers)
        res_attn = await client.get('/api/v1/attention', headers=headers)
        
        assert res_pulse.status_code == 200
        assert res_attn.status_code == 200
        
        pulse_data = res_pulse.json()
        attn_data = res_attn.json()
        
        # Incomplete profile
        assert pulse_data['completeness']['is_complete'] is False
        # No fabricated risk warnings
        for item in attn_data['items']:
            assert item['category'] in ['data_quality']
            assert 'Complete Your Financial Profile' in item['title']
    finally:
        await cleanup_user(session_factory, user_id)

@pytest.mark.asyncio
async def test_2_healthy_cash_flow(app_client):
    """TEST 2 — Healthy cash flow: Income = 100k, Expenses = 50k. Positive surplus, no negative cash-flow warning."""
    client, session_factory = app_client
    user_id = uuid.uuid4()
    headers = create_user_headers(user_id)
    try:
        await client.put('/api/v1/profile', json={'age': 30, 'city': 'Mumbai', 'emergency_fund': 300000.0}, headers=headers)
        await client.post('/api/v1/incomes', json={'source_name': 'Tech Salary', 'amount': 100000.0}, headers=headers)
        await client.post('/api/v1/expenses', json={'category': 'Rent and Living', 'amount': 50000.0}, headers=headers)
        
        res_pulse = await client.get('/api/v1/financial-pulse', headers=headers)
        res_attn = await client.get('/api/v1/attention', headers=headers)
        
        assert res_pulse.status_code == 200
        assert res_attn.status_code == 200
        
        pulse = res_pulse.json()['pulse']
        assert pulse['monthly_surplus'] == 50000.0
        assert pulse['savings_rate_pct'] == 50.0
        
        items = res_attn.json()['items']
        # No negative cash flow warnings
        negative_cf = [i for i in items if i['category'] == 'cash_flow' and i['severity'] in ['critical', 'high']]
        assert len(negative_cf) == 0
        # Check positive signal exists
        positive_cf = [i for i in items if i['category'] == 'cash_flow' and i['severity'] == 'positive']
        assert len(positive_cf) == 1
    finally:
        await cleanup_user(session_factory, user_id)

@pytest.mark.asyncio
async def test_3_negative_cash_flow(app_client):
    """TEST 3 — Negative cash flow: Income = 50k, Expenses = 60k. Grounded evidence, deterministic severity."""
    client, session_factory = app_client
    user_id = uuid.uuid4()
    headers = create_user_headers(user_id)
    try:
        await client.put('/api/v1/profile', json={'age': 28, 'city': 'Delhi'}, headers=headers)
        await client.post('/api/v1/incomes', json={'source_name': 'Contract Work', 'amount': 50000.0}, headers=headers)
        await client.post('/api/v1/expenses', json={'category': 'Lifestyle & Rent', 'amount': 60000.0}, headers=headers)
        
        res_attn = await client.get('/api/v1/attention', headers=headers)
        assert res_attn.status_code == 200
        items = res_attn.json()['items']
        
        deficit_item = next((i for i in items if i['category'] == 'cash_flow' and i['severity'] == 'critical'), None)
        assert deficit_item is not None
        assert deficit_item['metric_evidence']['monthly_surplus'] == -10000.0
        assert deficit_item['metric_evidence']['monthly_income'] == 50000.0
    finally:
        await cleanup_user(session_factory, user_id)

@pytest.mark.asyncio
async def test_4_debt_imbalance(app_client):
    """TEST 4 — Debt imbalance: Assets = 100k, Liabilities = 500k. Debt/net-worth attention reflects actual values."""
    client, session_factory = app_client
    user_id = uuid.uuid4()
    headers = create_user_headers(user_id)
    try:
        await client.put('/api/v1/profile', json={'age': 32, 'city': 'Bengaluru'}, headers=headers)
        await client.post('/api/v1/incomes', json={'source_name': 'Salary', 'amount': 80000.0}, headers=headers)
        await client.post('/api/v1/expenses', json={'category': 'Living', 'amount': 20000.0}, headers=headers)
        await client.post('/api/v1/assets', json={'asset_name': 'Savings Account', 'asset_type': 'Cash', 'current_value': 100000.0}, headers=headers)
        await client.post('/api/v1/liabilities', json={'loan_name': 'Personal Loan', 'loan_type': 'Personal', 'principal': 500000.0, 'outstanding': 500000.0, 'interest_rate': 12.0, 'emi': 15000.0}, headers=headers)
        
        res_pulse = await client.get('/api/v1/financial-pulse', headers=headers)
        res_attn = await client.get('/api/v1/attention', headers=headers)
        
        assert res_pulse.status_code == 200
        assert res_pulse.json()['pulse']['net_worth'] == -400000.0
        items = res_attn.json()['items']
        imbalance = next((i for i in items if i['dedup_key'] == 'debt_balance_sheet_position'), None)
        assert imbalance is not None
        assert imbalance['metric_evidence']['total_assets'] == 100000.0
        assert imbalance['metric_evidence']['total_liabilities'] == 500000.0
        # 5C.1 four explanation semantics
        assert imbalance['what'] is not None and len(imbalance['what']) > 0
        assert imbalance['why'] is not None and len(imbalance['why']) > 0
        assert imbalance['impact'] is not None and len(imbalance['impact']) > 0
        assert imbalance['next_step'] is not None and len(imbalance['next_step']) > 0
    finally:
        await cleanup_user(session_factory, user_id)

@pytest.mark.asyncio
async def test_5_goal_at_risk(app_client):
    """TEST 5 — Goal at risk: Goal underfunded/at-risk produces deterministic goal attention."""
    client, session_factory = app_client
    user_id = uuid.uuid4()
    headers = create_user_headers(user_id)
    try:
        await client.put('/api/v1/profile', json={'age': 27, 'city': 'Chennai'}, headers=headers)
        await client.post('/api/v1/incomes', json={'source_name': 'Salary', 'amount': 40000.0}, headers=headers)
        await client.post('/api/v1/expenses', json={'category': 'Living', 'amount': 30000.0}, headers=headers)
        await client.post('/api/v1/goals', json={'goal_name': 'Down Payment', 'target_amount': 1200000.0, 'saved_amount': 0.0, 'monthly_contribution': 5000.0, 'target_date': '2027-09-15'}, headers=headers)
        
        res_attn = await client.get('/api/v1/attention', headers=headers)
        assert res_attn.status_code == 200
        items = res_attn.json()['items']
        goal_item = next((i for i in items if i['category'] == 'goal' and i['severity'] == 'high'), None)
        assert goal_item is not None
        assert 'Down Payment' in goal_item['title']
    finally:
        await cleanup_user(session_factory, user_id)

@pytest.mark.asyncio
async def test_6_goal_on_track(app_client):
    """TEST 6 — Goal on track: Feasible goal produces positive on-track signal."""
    client, session_factory = app_client
    user_id = uuid.uuid4()
    headers = create_user_headers(user_id)
    try:
        await client.put('/api/v1/profile', json={'age': 30, 'city': 'Hyderabad'}, headers=headers)
        await client.post('/api/v1/incomes', json={'source_name': 'Salary', 'amount': 100000.0}, headers=headers)
        await client.post('/api/v1/expenses', json={'category': 'Living', 'amount': 30000.0}, headers=headers)
        await client.post('/api/v1/goals', json={'goal_name': 'Vacation Fund', 'target_amount': 100000.0, 'saved_amount': 50000.0, 'monthly_contribution': 25000.0, 'target_date': '2028-09-15'}, headers=headers)
        
        res_attn = await client.get('/api/v1/attention', headers=headers)
        assert res_attn.status_code == 200
        items = res_attn.json()['items']
        on_track = next((i for i in items if i['category'] == 'goal' and i['severity'] == 'positive'), None)
        assert on_track is not None
        assert 'Vacation Fund' in on_track['title']
    finally:
        await cleanup_user(session_factory, user_id)

@pytest.mark.asyncio
async def test_7_duplicate_findings_deduplication():
    """TEST 7 — Deduplication: Aggregator combines overlapping findings by dedup_key retaining strongest severity."""
    from app.engine.attention_aggregator import AttentionAggregator
    aggregator = AttentionAggregator()
    
    context = {
        'profile': {'age': 30, 'city': 'Mumbai', 'emergency_fund': 10000.0},
        'incomes': [{'amount': 100000.0}],
        'expenses': [{'amount': 50000.0}],
        'assets': [{'current_value': 100000.0}],
        'liabilities': [{'outstanding': 500000.0, 'emi': 50000.0}],
        'goals': []
    }
    rules = {
        'emergency_runway_months': 0.2,
        'dti_ratio_pct': 50.0,
        'savings_rate_pct': 0.0,
        'financial_health_score': 30,
        'net_worth': -400000.0
    }
    diagnosis = {'overall_state': {'label': 'Vulnerable', 'summary': 'Risks present'}}
    feasibility = {'goals': []}
    
    items = aggregator.aggregate(context, rules, diagnosis, feasibility)
    keys = [i.dedup_key for i in items if i.dedup_key]
    assert len(keys) == len(set(keys)), "Duplicate dedup_keys found in aggregated output"

@pytest.mark.asyncio
async def test_8_priority_ordering():
    """TEST 8 — Priority: critical > high > medium > low > positive."""
    from app.engine.attention_aggregator import AttentionAggregator
    aggregator = AttentionAggregator()
    
    context = {
        'profile': {'age': 30, 'city': 'Mumbai', 'emergency_fund': 5000.0},
        'incomes': [{'amount': 100000.0}],
        'expenses': [{'amount': 40000.0}],
        'assets': [{'current_value': 50000.0}],
        'liabilities': [{'outstanding': 400000.0, 'emi': 48000.0}],
        'goals': [{'id': 'g1', 'goal_name': 'House', 'target_amount': 5000000.0, 'saved_amount': 0.0, 'monthly_contribution': 5000.0}]
    }
    rules = {
        'emergency_runway_months': 0.1,
        'dti_ratio_pct': 48.0,
        'savings_rate_pct': 12.0,
        'financial_health_score': 35,
        'net_worth': -350000.0
    }
    diagnosis = {'overall_state': {'label': 'Vulnerable', 'summary': 'Risks present'}}
    feasibility = {'goals': [{'goal_id': 'g1', 'goal_name': 'House', 'target_amount': 5000000.0, 'saved_amount': 0.0, 'required_monthly_contribution': 100000.0, 'current_monthly_contribution': 5000.0, 'funding_gap': 4900000.0, 'status': 'UNDERFUNDED'}]}
    
    items = aggregator.aggregate(context, rules, diagnosis, feasibility)
    severity_order = [aggregator.SEVERITY_RANKS[i.severity] for i in items]
    assert severity_order == sorted(severity_order), "Attention items not sorted by severity rank"

@pytest.mark.asyncio
async def test_9_partial_data_completeness(app_client):
    """TEST 9 — Partial data: Income exists, expenses missing => completeness warning, missing != zero."""
    client, session_factory = app_client
    user_id = uuid.uuid4()
    headers = create_user_headers(user_id)
    try:
        await client.put('/api/v1/profile', json={'age': 25, 'city': 'Kolkata'}, headers=headers)
        await client.post('/api/v1/incomes', json={'source_name': 'Salary', 'amount': 70000.0}, headers=headers)
        
        res_pulse = await client.get('/api/v1/financial-pulse', headers=headers)
        res_attn = await client.get('/api/v1/attention', headers=headers)
        
        assert res_pulse.status_code == 200
        assert res_attn.status_code == 200
        
        pulse_data = res_pulse.json()
        assert pulse_data['completeness']['has_income'] is True
        assert pulse_data['completeness']['has_expenses'] is False
        assert pulse_data['completeness']['is_complete'] is False
        
        items = res_attn.json()['items']
        missing_exp = next((i for i in items if i['id'] == 'data_quality_missing_expenses'), None)
        assert missing_exp is not None
        assert 'Add Monthly Living Expenses' in missing_exp['title']
    finally:
        await cleanup_user(session_factory, user_id)

@pytest.mark.asyncio
async def test_10_tenant_isolation(app_client):
    """TEST 10 — Tenant isolation: Tenant A cannot receive Tenant B pulse/attention."""
    client, session_factory = app_client
    user_a = uuid.uuid4()
    user_b = uuid.uuid4()
    headers_a = create_user_headers(user_a)
    headers_b = create_user_headers(user_b)
    
    try:
        # Tenant A inserts high income
        await client.put('/api/v1/profile', json={'age': 35, 'city': 'Noida'}, headers=headers_a)
        await client.post('/api/v1/incomes', json={'source_name': 'Tenant A High Income', 'amount': 250000.0}, headers=headers_a)
        
        # Tenant B requests pulse
        res_pulse_b = await client.get('/api/v1/financial-pulse', headers=headers_b)
        assert res_pulse_b.status_code == 200
        pulse_b = res_pulse_b.json()['pulse']
        
        # Verify Tenant B sees 0 income, not Tenant A's 250k
        assert pulse_b['monthly_income'] == 0.0
    finally:
        await cleanup_user(session_factory, user_a)
        await cleanup_user(session_factory, user_b)

@pytest.mark.asyncio
async def test_11_api_read_only(app_client):
    """TEST 11 — API read-only: Calling GET /attention and GET /financial-pulse does not create rows."""
    client, session_factory = app_client
    user_id = uuid.uuid4()
    headers = create_user_headers(user_id)
    
    async with session_factory() as session:
        async with session.begin():
            await session.execute(text('RESET ROLE;'))
            res_goals_before = await session.execute(text(f"SELECT count(*) FROM goals WHERE user_id = '{user_id}';"))
            count_before = res_goals_before.scalar()
    
    res_pulse = await client.get('/api/v1/financial-pulse', headers=headers)
    res_attn = await client.get('/api/v1/attention', headers=headers)
    res_goals = await client.get('/api/v1/goals', headers=headers)
    assert res_pulse.status_code == 200
    assert res_attn.status_code == 200
    assert res_goals.status_code == 200
    
    async with session_factory() as session:
        async with session.begin():
            await session.execute(text('RESET ROLE;'))
            res_goals_after = await session.execute(text(f"SELECT count(*) FROM goals WHERE user_id = '{user_id}';"))
            count_after = res_goals_after.scalar()
            
    assert count_before == count_after == 0
    await cleanup_user(session_factory, user_id)

@pytest.mark.asyncio
async def test_12_determinism(app_client):
    """TEST 12 — Determinism: Repeated requests produce identical attention ordering and content."""
    client, session_factory = app_client
    user_id = uuid.uuid4()
    headers = create_user_headers(user_id)
    try:
        await client.put('/api/v1/profile', json={'age': 30, 'city': 'Jaipur', 'emergency_fund': 50000.0}, headers=headers)
        await client.post('/api/v1/incomes', json={'source_name': 'Business', 'amount': 90000.0}, headers=headers)
        await client.post('/api/v1/expenses', json={'category': 'Operations', 'amount': 30000.0}, headers=headers)
        await client.post('/api/v1/assets', json={'asset_name': 'Gold', 'asset_type': 'Commodity', 'current_value': 200000.0}, headers=headers)
        await client.post('/api/v1/liabilities', json={'loan_name': 'Equipment Loan', 'loan_type': 'Business', 'principal': 300000.0, 'outstanding': 300000.0, 'interest_rate': 10.0, 'emi': 12000.0}, headers=headers)
        
        res_1 = await client.get('/api/v1/attention', headers=headers)
        res_2 = await client.get('/api/v1/attention', headers=headers)
        
        assert res_1.status_code == 200
        assert res_2.status_code == 200
        assert res_1.json() == res_2.json()
    finally:
        await cleanup_user(session_factory, user_id)

@pytest.mark.asyncio
async def test_13_emergency_fund_semantics(app_client):
    """TEST 13 — Emergency fund semantics: Total assets != designated emergency reserve. Unknown / Not designated state."""
    client, session_factory = app_client
    user_id = uuid.uuid4()
    headers = create_user_headers(user_id)
    try:
        # Profile without designated emergency fund, but has assets and expenses
        await client.put('/api/v1/profile', json={'age': 30, 'city': 'Bangalore'}, headers=headers)
        await client.post('/api/v1/incomes', json={'source_name': 'Salary', 'amount': 100000.0}, headers=headers)
        await client.post('/api/v1/expenses', json={'category': 'Living', 'amount': 40000.0}, headers=headers)
        await client.post('/api/v1/assets', json={'asset_name': 'Real Estate / Mutual Funds', 'asset_type': 'Property', 'current_value': 1500000.0}, headers=headers)
        
        res_pulse = await client.get('/api/v1/financial-pulse', headers=headers)
        res_attn = await client.get('/api/v1/attention', headers=headers)
        
        assert res_pulse.status_code == 200
        assert res_attn.status_code == 200
        
        pulse = res_pulse.json()['pulse']
        # Emergency reserve must NOT equate to 15L total assets
        assert pulse['emergency_fund_status'] == 'Unknown / Not designated'
        assert pulse['emergency_runway_months'] == 0.0
        
        items = res_attn.json()['items']
        emg_item = next((i for i in items if i['category'] == 'emergency_fund'), None)
        assert emg_item is not None
        assert 'Unknown / Not Designated' in emg_item['title']
        assert emg_item['what'] is not None and len(emg_item['what']) > 0
        assert emg_item['why'] is not None and len(emg_item['why']) > 0
        assert emg_item['impact'] is not None and len(emg_item['impact']) > 0
        assert emg_item['next_step'] is not None and len(emg_item['next_step']) > 0
    finally:
        await cleanup_user(session_factory, user_id)
