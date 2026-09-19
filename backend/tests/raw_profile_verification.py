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

async def run_raw_verification():
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
        # Generate disposable users
        user_a_id = uuid.uuid4()
        token_a = jwt.encode({'sub': str(user_a_id), 'email': 'raw_test_a@example.com', 'aud': 'authenticated'}, settings.JWT_SECRET, algorithm='HS256')
        headers_a = {'Authorization': f'Bearer {token_a}'}

        user_b_id = uuid.uuid4()
        token_b = jwt.encode({'sub': str(user_b_id), 'email': 'raw_test_b@example.com', 'aud': 'authenticated'}, settings.JWT_SECRET, algorithm='HS256')
        headers_b = {'Authorization': f'Bearer {token_b}'}

        print('=== 1. PROFILE GET RAW EVIDENCE ===')
        res_get_a = await client.get('/api/v1/profile', headers=headers_a)
        print(f'HTTP Status: {res_get_a.status_code}')
        data_a_init = res_get_a.json()
        print(f'Initial Profile A keys: {list(data_a_init.keys())}')
        print(f'Initial Profile A user_id: {data_a_init["user_id"]}')
        assert res_get_a.status_code == 200
        assert data_a_init['user_id'] == str(user_a_id)

        print('\n=== 2. PROFILE PUT RAW EVIDENCE ===')
        update_payload = {
            'occupation': 'Quant Strategist',
            'city': 'Mumbai',
            'age': 34,
            'marital_status': 'Married',
            'dependents': 2,
            'risk_appetite': 'Aggressive'
        }
        res_put_a = await client.put('/api/v1/profile', json=update_payload, headers=headers_a)
        print(f'HTTP Status: {res_put_a.status_code}')
        data_a_updated = res_put_a.json()
        print(f'Updated Profile A: {data_a_updated}')
        assert res_put_a.status_code == 200
        assert data_a_updated['occupation'] == 'Quant Strategist'
        assert data_a_updated['city'] == 'Mumbai'
        assert data_a_updated['age'] == 34
        assert data_a_updated['dependents'] == 2
        assert data_a_updated['risk_appetite'] == 'Aggressive'

        print('\n=== 3. PROFILE PERSISTENCE RAW EVIDENCE ===')
        res_get_a_persisted = await client.get('/api/v1/profile', headers=headers_a)
        data_a_persisted = res_get_a_persisted.json()
        print(f'Persisted Profile A: {data_a_persisted}')
        assert res_get_a_persisted.status_code == 200
        assert data_a_persisted['occupation'] == 'Quant Strategist'
        assert data_a_persisted['city'] == 'Mumbai'
        assert data_a_persisted['age'] == 34
        assert data_a_persisted['dependents'] == 2
        assert data_a_persisted['risk_appetite'] == 'Aggressive'

        print('\n=== 4. TENANT ISOLATION RAW EVIDENCE ===')
        res_get_b = await client.get('/api/v1/profile', headers=headers_b)
        data_b = res_get_b.json()
        print(f'User B profile user_id: {data_b["user_id"]}')
        print(f'User B occupation: {data_b["occupation"]}')
        assert res_get_b.status_code == 200
        assert data_b['user_id'] == str(user_b_id)
        assert data_b['occupation'] != 'Quant Strategist'
        assert data_b['user_id'] != str(user_a_id)

        # Cleanup
        async with AsyncSessionLocal() as session:
            async with session.begin():
                await session.execute(text('RESET ROLE;'))
                await session.execute(text(f"DELETE FROM users WHERE id IN ('{user_a_id}', '{user_b_id}');"))
        print('\n=== ALL RAW BACKEND CHECKS EXECUTED SUCCESSFULLY ===')

if __name__ == '__main__':
    asyncio.run(run_raw_verification())
