import asyncio
import os
import re
import uuid
import jwt
from httpx import AsyncClient, ASGITransport
from dotenv import dotenv_values
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy import text

env_path = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '.env.local'))
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

async def run_projection_investigation():
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
        # Case A: Brand new user with no financial history
        user_empty_id = uuid.uuid4()
        token_empty = jwt.encode({'sub': str(user_empty_id), 'email': 'empty_user@example.com', 'aud': 'authenticated'}, settings.JWT_SECRET, algorithm='HS256')
        headers_empty = {'Authorization': f'Bearer {token_empty}'}

        print('=== TEST 1: GET /api/v1/cashflow/projection FOR EMPTY USER ===')
        res_empty = await client.get('/api/v1/cashflow/projection', headers=headers_empty)
        print(f'HTTP Status: {res_empty.status_code}')
        print(f'Response Payload: {res_empty.json()}')

        # Case B: User with populated financial records
        user_pop_id = uuid.uuid4()
        token_pop = jwt.encode({'sub': str(user_pop_id), 'email': 'pop_user@example.com', 'aud': 'authenticated'}, settings.JWT_SECRET, algorithm='HS256')
        headers_pop = {'Authorization': f'Bearer {token_pop}'}

        # Put profile and create income
        await client.put('/api/v1/profile', json={'monthly_income': 100000.0, 'monthly_expenses': 40000.0, 'monthly_savings': 60000.0, 'emergency_fund': 200000.0}, headers=headers_pop)
        
        print('\n=== TEST 2: GET /api/v1/cashflow/projection FOR POPULATED USER ===')
        res_pop = await client.get('/api/v1/cashflow/projection', headers=headers_pop)
        print(f'HTTP Status: {res_pop.status_code}')
        print(f'Response Payload: {res_pop.json()}')

        # Case C: Check /api/v1/simulate
        print('\n=== TEST 3: POST /api/v1/simulate FOR POPULATED USER ===')
        res_sim = await client.post('/api/v1/simulate', json={'type': 'INCOME_CHANGE', 'parameters': {'value': 20000.0, 'change_type': 'absolute'}}, headers=headers_pop)
        print(f'Simulate Status: {res_sim.status_code}')
        print(f'Simulate Payload Keys: {list(res_sim.json().keys())}')

        # Cleanup
        async with AsyncSessionLocal() as session:
            async with session.begin():
                await session.execute(text('RESET ROLE;'))
                await session.execute(text(f"DELETE FROM users WHERE id IN ('{user_empty_id}', '{user_pop_id}');"))
        print('\n=== INVESTIGATION RUNTIME PROBES COMPLETED ===')

if __name__ == '__main__':
    asyncio.run(run_projection_investigation())
