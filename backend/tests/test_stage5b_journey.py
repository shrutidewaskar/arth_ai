import asyncio
import os
import re
import uuid
import jwt
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

engine = create_async_engine(db_url, echo=False)
AsyncSessionLocal = async_sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)

import sys
sys.path.append(os.path.join(os.path.dirname(__file__), '..'))

from app.main import app
from app.config import settings
from app.database import get_db

async def run_journey():
    async def override_get_db():
        async with AsyncSessionLocal() as session:
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
        # 1. Fresh disposable user
        user_id = uuid.uuid4()
        email = f'journey_{user_id.hex[:8]}@example.com'
        payload = {'sub': str(user_id), 'email': email, 'aud': 'authenticated', 'user_metadata': {'full_name': 'Journey User'}}
        token = jwt.encode(payload, settings.JWT_SECRET, algorithm='HS256')
        headers = {'Authorization': f'Bearer {token}'}
        
        print('=== STAGE 5B USER JOURNEY TEST ===')
        
        # A. Fresh user - verify all collections are empty
        res_incomes = await client.get('/api/v1/incomes', headers=headers)
        res_expenses = await client.get('/api/v1/expenses', headers=headers)
        res_assets = await client.get('/api/v1/assets', headers=headers)
        res_liabs = await client.get('/api/v1/liabilities', headers=headers)
        res_goals = await client.get('/api/v1/goals', headers=headers)
        
        print(f'A. Fresh user collections: Incomes={res_incomes.json()}, Expenses={res_expenses.json()}, Assets={res_assets.json()}, Liabs={res_liabs.json()}, Goals={res_goals.json()}')
        assert res_incomes.json() == []
        assert res_expenses.json() == []
        assert res_assets.json() == []
        assert res_liabs.json() == []
        assert res_goals.json() == []
        
        # B. Check Onboarding Status
        res_status = await client.get('/api/v1/onboarding/status', headers=headers)
        print(f'B. Fresh user onboarding status: {res_status.json()}')
        assert res_status.json()['complete'] is False
        
        # C. Enter explicit data
        # Profile
        res_p = await client.put('/api/v1/profile', json={'age': 29, 'city': 'Pune', 'occupation': 'Architect', 'marital_status': 'Single', 'dependents': 0}, headers=headers)
        assert res_p.status_code == 200
        # Income: ₹80,000/month
        res_inc = await client.post('/api/v1/incomes', json={'source_name': 'Architect Salary', 'type': 'Salary', 'amount': 80000.0, 'frequency': 'Monthly'}, headers=headers)
        assert res_inc.status_code == 200
        inc_id = res_inc.json()['id']
        # Expense: ₹20,000/month
        res_exp = await client.post('/api/v1/expenses', json={'category': 'Housing Rent', 'amount': 20000.0, 'essential': True}, headers=headers)
        assert res_exp.status_code == 200
        # Asset: ₹1,00,000
        res_ast = await client.post('/api/v1/assets', json={'asset_name': 'Bank Savings', 'asset_type': 'Cash', 'current_value': 100000.0}, headers=headers)
        assert res_ast.status_code == 200
        # Liability: ₹5,00,000
        res_lia = await client.post('/api/v1/liabilities', json={'loan_name': 'Education Loan', 'loan_type': 'EducationLoan', 'principal': 500000.0, 'outstanding': 500000.0, 'interest_rate': 8.5, 'emi': 10000.0}, headers=headers)
        assert res_lia.status_code == 200
        # Goal: ₹10,00,000 target, ₹1,00,000 saved
        res_gol = await client.post('/api/v1/goals', json={'goal_name': 'Emergency Reserve', 'category': 'Emergency', 'target_amount': 1000000.0, 'saved_amount': 100000.0, 'monthly_contribution': 15000.0, 'priority': 'Critical'}, headers=headers)
        assert res_gol.status_code == 200
        goal_id = res_gol.json()['id']
        
        # Test Validation: Reject negative amount
        res_neg = await client.post('/api/v1/incomes', json={'source_name': 'Invalid', 'amount': -5000.0}, headers=headers)
        assert res_neg.status_code == 422
        print('Validation check: Negative income correctly rejected with 422.')
        
        # D. Onboarding Status now
        res_status2 = await client.get('/api/v1/onboarding/status', headers=headers)
        print(f'D. Post-entry onboarding status: {res_status2.json()}')
        assert res_status2.json()['complete'] is True
        
        # E. Reload - verify persistence
        res_incomes_re = await client.get('/api/v1/incomes', headers=headers)
        res_assets_re = await client.get('/api/v1/assets', headers=headers)
        assert len(res_incomes_re.json()) == 1
        assert float(res_incomes_re.json()[0]['amount']) == 80000.0
        assert len(res_assets_re.json()) == 1
        assert float(res_assets_re.json()[0]['current_value']) == 100000.0
        print('E. Reload persistence verified.')
        
        # F. Dashboard summary
        res_dash = await client.get('/api/v1/dashboard/summary', headers=headers)
        dash = res_dash.json()
        print('F. Dashboard summary outputs:')
        print(f'   assets = Rs.{dash["net_worth"]["total_assets"]}')
        print(f'   liabilities = Rs.{dash["net_worth"]["total_liabilities"]}')
        print(f'   net worth = Rs.{dash["net_worth"]["net_worth"]}')
        print(f'   monthly income = Rs.{dash["cash_flow"]["monthly_income"]}')
        print(f'   monthly expenses = Rs.{dash["cash_flow"]["monthly_expenses"]}')
        print(f'   goal target = Rs.{dash["goals"][0]["target_amount"]}')
        
        assert dash['net_worth']['total_assets'] == 100000.0
        assert dash['net_worth']['total_liabilities'] == 500000.0
        assert dash['net_worth']['net_worth'] == -400000.0
        assert dash['cash_flow']['monthly_income'] == 80000.0
        assert dash['cash_flow']['monthly_expenses'] == 20000.0
        assert dash['goals'][0]['target_amount'] == 1000000.0
        
        # H. Remove a record
        await client.delete(f'/api/v1/incomes/{inc_id}', headers=headers)
        res_incomes_after = await client.get('/api/v1/incomes', headers=headers)
        assert len(res_incomes_after.json()) == 0
        res_dash_after = await client.get('/api/v1/dashboard/summary', headers=headers)
        assert res_dash_after.json()['cash_flow']['monthly_income'] == 0.0
        print('H. Deletion and recalculation verified.')
        
        # Cleanup
        async with AsyncSessionLocal() as session:
            async with session.begin():
                await session.execute(text('RESET ROLE;'))
                await session.execute(text(f'DELETE FROM users WHERE id = \'{user_id}\';'))
        print('=== ALL USER JOURNEY TESTS COMPLETED SUCCESSFULLY ===')

if __name__ == '__main__':
    asyncio.run(run_journey())
