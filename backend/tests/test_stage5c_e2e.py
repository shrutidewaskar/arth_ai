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

async def run_e2e():
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
    
    user_id = uuid.uuid4()
    email = f'stage5c_e2e_{user_id.hex[:8]}@example.com'
    payload = {'sub': str(user_id), 'email': email, 'aud': 'authenticated', 'user_metadata': {'full_name': 'E2E User'}}
    token = jwt.encode(payload, settings.JWT_SECRET, algorithm='HS256')
    headers = {'Authorization': f'Bearer {token}'}
    
    async with AsyncClient(transport=transport, base_url='http://testserver') as client:
        print('=== STAGE 5C SECTION 22 END-TO-END VERIFICATION ===')
        # Insert user data
        await client.put('/api/v1/profile', json={'age': 30, 'city': 'Pune'}, headers=headers)
        await client.post('/api/v1/incomes', json={'source_name': 'Salary', 'amount': 80000.0}, headers=headers)
        await client.post('/api/v1/expenses', json={'category': 'Rent', 'amount': 20000.0}, headers=headers)
        await client.post('/api/v1/assets', json={'asset_name': 'Cash Buffer', 'asset_type': 'Cash', 'current_value': 100000.0}, headers=headers)
        await client.post('/api/v1/liabilities', json={'loan_name': 'Personal Loan', 'loan_type': 'Personal', 'principal': 500000.0, 'outstanding': 500000.0, 'interest_rate': 10.0, 'emi': 10000.0}, headers=headers)
        await client.post('/api/v1/goals', json={'goal_name': 'Emergency Buffer', 'target_amount': 1000000.0, 'saved_amount': 100000.0, 'monthly_contribution': 10000.0, 'target_date': '2027-12-31'}, headers=headers)
        
        # 1. Call GET /financial-pulse
        res_pulse = await client.get('/api/v1/financial-pulse', headers=headers)
        pulse = res_pulse.json()['pulse']
        print(f'Financial Pulse Net Worth: Rs.{pulse["net_worth"]}')
        print(f'Financial Pulse Monthly Surplus: Rs.{pulse["monthly_surplus"]}')
        assert pulse['net_worth'] == -400000.0
        assert pulse['monthly_surplus'] == 50000.0
        
        # 2. Call GET /attention
        res_attn1 = await client.get('/api/v1/attention', headers=headers)
        res_attn2 = await client.get('/api/v1/attention', headers=headers)
        items = res_attn1.json()['items']
        print(f'Attention Items Count: {len(items)}')
        for item in items:
            print(f'  [{item["severity"].upper()}] {item["category"]}: {item["title"]} -> Route: {item["target_route"]}')
        
        # Verify determinism across repeated calls
        assert res_attn1.json() == res_attn2.json()
        print('E2E Assertions passed!')
        
        # Cleanup
        async with AsyncSessionLocal() as session:
            async with session.begin():
                await session.execute(text('RESET ROLE;'))
                await session.execute(text(f"DELETE FROM users WHERE id = '{user_id}';"))
        print('Cleanup completed.')

if __name__ == '__main__':
    asyncio.run(run_e2e())
