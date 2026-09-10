import os
import uuid
import pytest
import pytest_asyncio
import sqlalchemy as sa
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from dotenv import dotenv_values

TABLES_18 = [
    "users",
    "financial_profiles",
    "income_sources",
    "expense_categories",
    "assets",
    "liabilities",
    "goals",
    "investments",
    "insurance",
    "subscriptions",
    "documents",
    "document_financial_facts",
    "document_chunks",
    "ai_memories",
    "conversations",
    "messages",
    "ai_insights",
    "decision_simulations",
]

env_path = os.path.join(os.path.dirname(__file__), '..', '..', '.env.local')
env = dotenv_values(env_path) if os.path.exists(env_path) else {}

import re
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
    reason="PostgreSQL RLS suite requires a live PostgreSQL instance"
)

@pytest_asyncio.fixture
async def pg_engine():
    if not is_postgres:
        pytest.skip("PostgreSQL connection not configured")
    engine = create_async_engine(TEST_POSTGRES_ASYNC_URL, echo=False)
    yield engine
    await engine.dispose()

@pytest.mark.asyncio
async def test_role_security(pg_engine):
    """Verify application role arthai_app_test is non-superuser and does not bypass RLS."""
    async with pg_engine.connect() as conn:
        role_res = await conn.execute(
            sa.text("SELECT rolname, rolsuper, rolbypassrls FROM pg_roles WHERE rolname = 'arthai_app_test';")
        )
        role_info = role_res.fetchone()
        assert role_info is not None, "Role arthai_app_test not found in database!"
        assert not role_info[1], "Role arthai_app_test is a superuser!"
        assert not role_info[2], "Role arthai_app_test has BYPASSRLS!"

@pytest.mark.asyncio
async def test_rls_and_force_rls_metadata(pg_engine):
    """Verify all 18 tables have relrowsecurity=true and relforcerowsecurity=true in public schema."""
    async with pg_engine.connect() as conn:
        res = await conn.execute(sa.text("""
            SELECT relname, relrowsecurity, relforcerowsecurity
            FROM pg_class
            JOIN pg_namespace n ON n.oid = pg_class.relnamespace
            WHERE relname = ANY(:tables) AND n.nspname = 'public';
        """), {"tables": TABLES_18})
        rows = {r[0]: (r[1], r[2]) for r in res.fetchall()}
        
        for table in TABLES_18:
            assert table in rows, f"Table {table} not found in database metadata"
            assert rows[table][0], f"Table {table} does not have RLS enabled (relrowsecurity=False)"
            assert rows[table][1], f"Table {table} does not have FORCE RLS enabled (relforcerowsecurity=False)"

@pytest.mark.asyncio
async def test_rls_policies_exist(pg_engine):
    """Verify that tenant isolation policies exist for all 18 tables in public schema."""
    async with pg_engine.connect() as conn:
        res = await conn.execute(sa.text("""
            SELECT tablename, policyname, cmd
            FROM pg_policies
            WHERE tablename = ANY(:tables) AND schemaname = 'public';
        """), {"tables": TABLES_18})
        policies = {r[0]: r[1] for r in res.fetchall()}
        
        for table in TABLES_18:
            assert table in policies, f"Table {table} does not have any RLS policy defined in pg_policies"

@pytest.mark.asyncio
async def test_tenant_isolation_crud_as_app_role(pg_engine):
    """Verify complete CRUD isolation, messages hierarchy, and ownership protection under arthai_app_test role."""
    async_session = async_sessionmaker(pg_engine, expire_on_commit=False, class_=AsyncSession)
    
    tenant_a = uuid.uuid4()
    tenant_b = uuid.uuid4()
    asset_a_id = uuid.uuid4()
    asset_b_id = uuid.uuid4()
    doc_a_id = uuid.uuid4()
    conv_a = uuid.uuid4()
    conv_b = uuid.uuid4()
    
    try:
        # 1. Setup Tenant A data within transaction as arthai_app_test
        async with async_session() as session:
            async with session.begin():
                await session.execute(sa.text("SET ROLE arthai_app_test;"))
                await session.execute(sa.text("SELECT set_config('app.current_user_id', :uid, true);"), {"uid": str(tenant_a)})
                
                await session.execute(sa.text("INSERT INTO users (id, email, full_name) VALUES (:id, :email, :name);"),
                                      {"id": tenant_a, "email": f"a_{tenant_a}@example.com", "name": "Tenant A"})
                await session.execute(sa.text("INSERT INTO financial_profiles (id, user_id, monthly_income) VALUES (:id, :uid, 50000);"),
                                      {"id": uuid.uuid4(), "uid": tenant_a})
                await session.execute(sa.text("INSERT INTO assets (id, user_id, asset_name, asset_type, current_value) VALUES (:id, :uid, 'A_TEST_ASSET', 'MutualFunds', 100000);"),
                                      {"id": asset_a_id, "uid": tenant_a})
                await session.execute(sa.text("INSERT INTO documents (id, user_id, document_type, storage_path, file_name) VALUES (:id, :uid, 'SalarySlip', '/path/a.pdf', 'a.pdf');"),
                                      {"id": doc_a_id, "uid": tenant_a})
                await session.execute(sa.text("INSERT INTO document_financial_facts (id, document_id, user_id, fact_type, fact_key, fact_value) VALUES (:id, :did, :uid, 'Income', 'Salary', '50000');"),
                                      {"id": uuid.uuid4(), "did": doc_a_id, "uid": tenant_a})
                await session.execute(sa.text("INSERT INTO document_chunks (id, document_id, user_id, page_number, chunk_index, content) VALUES (:id, :did, :uid, 1, 0, 'Tenant A salary content');"),
                                      {"id": uuid.uuid4(), "did": doc_a_id, "uid": tenant_a})
                await session.execute(sa.text("INSERT INTO conversations (id, user_id, title) VALUES (:id, :uid, 'Conv A');"),
                                      {"id": conv_a, "uid": tenant_a})
                await session.execute(sa.text("INSERT INTO messages (id, conversation_id, role, content) VALUES (:id, :cid, 'user', 'Hello A');"),
                                      {"id": uuid.uuid4(), "cid": conv_a})

        # 2. Setup Tenant B data within transaction as arthai_app_test
        async with async_session() as session:
            async with session.begin():
                await session.execute(sa.text("SET ROLE arthai_app_test;"))
                await session.execute(sa.text("SELECT set_config('app.current_user_id', :uid, true);"), {"uid": str(tenant_b)})
                
                await session.execute(sa.text("INSERT INTO users (id, email, full_name) VALUES (:id, :email, :name);"),
                                      {"id": tenant_b, "email": f"b_{tenant_b}@example.com", "name": "Tenant B"})
                await session.execute(sa.text("INSERT INTO assets (id, user_id, asset_name, asset_type, current_value) VALUES (:id, :uid, 'B_TEST_ASSET', 'Gold', 200000);"),
                                      {"id": asset_b_id, "uid": tenant_b})
                await session.execute(sa.text("INSERT INTO conversations (id, user_id, title) VALUES (:id, :uid, 'Conv B');"),
                                      {"id": conv_b, "uid": tenant_b})
                await session.execute(sa.text("INSERT INTO messages (id, conversation_id, role, content) VALUES (:id, :cid, 'user', 'Hello B');"),
                                      {"id": uuid.uuid4(), "cid": conv_b})

        # 3. Test Tenant A SELECT, UPDATE, DELETE isolation
        async with async_session() as session:
            async with session.begin():
                await session.execute(sa.text("SET ROLE arthai_app_test;"))
                await session.execute(sa.text("SELECT set_config('app.current_user_id', :uid, true);"), {"uid": str(tenant_a)})
                
                # Own SELECT
                res_a = await session.execute(sa.text("SELECT id FROM users;"))
                user_ids = [r[0] for r in res_a.fetchall()]
                assert tenant_a in user_ids
                assert tenant_b not in user_ids
                
                # Assets SELECT isolation
                asset_res = await session.execute(sa.text("SELECT asset_name FROM assets;"))
                asset_names = [r[0] for r in asset_res.fetchall()]
                assert "A_TEST_ASSET" in asset_names
                assert "B_TEST_ASSET" not in asset_names
                
                # Documents, Facts, Chunks SELECT isolation
                doc_res = await session.execute(sa.text("SELECT file_name FROM documents;"))
                assert [r[0] for r in doc_res.fetchall()] == ["a.pdf"]
                
                fact_res = await session.execute(sa.text("SELECT fact_key FROM document_financial_facts;"))
                assert [r[0] for r in fact_res.fetchall()] == ["Salary"]
                
                chunk_res = await session.execute(sa.text("SELECT content FROM document_chunks;"))
                assert "Tenant A salary content" in [r[0] for r in chunk_res.fetchall()]
                
                # Cross-tenant UPDATE blocked (0 rows affected)
                upd = await session.execute(sa.text("UPDATE assets SET asset_name = 'Hacked' WHERE user_id = :uid;"), {"uid": tenant_b})
                assert upd.rowcount == 0
                
                # Cross-tenant DELETE blocked (0 rows affected)
                dele = await session.execute(sa.text("DELETE FROM assets WHERE user_id = :uid;"), {"uid": tenant_b})
                assert dele.rowcount == 0

        # 4. Test Tenant A Cross-tenant INSERT rejected in dedicated transaction
        async with async_session() as session:
            async with session.begin():
                await session.execute(sa.text("SET ROLE arthai_app_test;"))
                await session.execute(sa.text("SELECT set_config('app.current_user_id', :uid, true);"), {"uid": str(tenant_a)})
                with pytest.raises(Exception) as excinfo:
                    await session.execute(sa.text("INSERT INTO assets (id, user_id, asset_name, asset_type, current_value) VALUES (:id, :uid, 'MALICIOUS_INSERT', 'RealEstate', 500000);"),
                                          {"id": uuid.uuid4(), "uid": tenant_b})
                assert "row-level security" in str(excinfo.value).lower() or "policy" in str(excinfo.value).lower()

        # 5. Test Ownership transfer rejected in dedicated transaction
        async with async_session() as session:
            async with session.begin():
                await session.execute(sa.text("SET ROLE arthai_app_test;"))
                await session.execute(sa.text("SELECT set_config('app.current_user_id', :uid, true);"), {"uid": str(tenant_a)})
                with pytest.raises(Exception) as excinfo_trans:
                    await session.execute(sa.text("UPDATE assets SET user_id = :b_uid WHERE id = :a_id;"),
                                          {"b_uid": tenant_b, "a_id": asset_a_id})
                assert "row-level security" in str(excinfo_trans.value).lower() or "policy" in str(excinfo_trans.value).lower()

        # 6. Test Tenant B isolation under arthai_app_test
        async with async_session() as session:
            async with session.begin():
                await session.execute(sa.text("SET ROLE arthai_app_test;"))
                await session.execute(sa.text("SELECT set_config('app.current_user_id', :uid, true);"), {"uid": str(tenant_b)})
                
                # Own SELECT
                res_b = await session.execute(sa.text("SELECT id FROM users;"))
                user_ids_b = [r[0] for r in res_b.fetchall()]
                assert tenant_b in user_ids_b
                assert tenant_a not in user_ids_b
                
                # Messages isolation
                msg_res = await session.execute(sa.text("SELECT content FROM messages;"))
                msgs = [r[0] for r in msg_res.fetchall()]
                assert "Hello B" in msgs
                assert "Hello A" not in msgs

        # 7. Test Cross-tenant conversation messages INSERT rejected
        async with async_session() as session:
            async with session.begin():
                await session.execute(sa.text("SET ROLE arthai_app_test;"))
                await session.execute(sa.text("SELECT set_config('app.current_user_id', :uid, true);"), {"uid": str(tenant_b)})
                with pytest.raises(Exception) as excinfo_msg:
                    await session.execute(sa.text("INSERT INTO messages (id, conversation_id, role, content) VALUES (:id, :cid, 'user', 'Malicious message into Conv A');"),
                                          {"id": uuid.uuid4(), "cid": conv_a})
                assert "row-level security" in str(excinfo_msg.value).lower() or "policy" in str(excinfo_msg.value).lower()

        # 8. Test missing tenant identity fails closed
        async with async_session() as session:
            async with session.begin():
                await session.execute(sa.text("SET ROLE arthai_app_test;"))
                try:
                    res_empty = await session.execute(sa.text("SELECT COUNT(*) FROM users;"))
                    assert res_empty.scalar() == 0
                except Exception as e:
                    assert "invalid input syntax for type uuid" in str(e).lower()

        # 9. Test invalid / random tenant identity fails closed
        async with async_session() as session:
            async with session.begin():
                await session.execute(sa.text("SET ROLE arthai_app_test;"))
                await session.execute(sa.text("SELECT set_config('app.current_user_id', :uid, true);"), {"uid": str(uuid.uuid4())})
                res_rand = await session.execute(sa.text("SELECT COUNT(*) FROM users;"))
                assert res_rand.scalar() == 0

    finally:
        # 10. Clean up synthetic test data using administrative role
        async with async_session() as session:
            async with session.begin():
                await session.execute(sa.text("RESET ROLE;"))
                await session.execute(sa.text("SELECT set_config('app.current_user_id', :uid, true);"), {"uid": str(tenant_a)})
                await session.execute(sa.text("DELETE FROM users WHERE id = :a;"), {"a": tenant_a})
                await session.execute(sa.text("SELECT set_config('app.current_user_id', :uid, true);"), {"uid": str(tenant_b)})
                await session.execute(sa.text("DELETE FROM users WHERE id = :b;"), {"b": tenant_b})

@pytest.mark.asyncio
async def test_transaction_local_leak_prevention(pg_engine):
    """Verify transaction-local setting is cleared across transactions on the same connection."""
    async_session = async_sessionmaker(pg_engine, expire_on_commit=False, class_=AsyncSession)
    tenant_x = uuid.uuid4()
    
    # Tx 1: Set identity
    async with async_session() as session:
        async with session.begin():
            await session.execute(sa.text("SET ROLE arthai_app_test;"))
            await session.execute(sa.text("SELECT set_config('app.current_user_id', :uid, true);"), {"uid": str(tenant_x)})
            res = await session.execute(sa.text("SELECT current_setting('app.current_user_id', true);"))
            assert res.scalar() == str(tenant_x)
            
    # Tx 2: Same connection pool / session, ensure identity is reset and fails closed
    async with async_session() as session:
        async with session.begin():
            await session.execute(sa.text("SET ROLE arthai_app_test;"))
            res2 = await session.execute(sa.text("SELECT current_setting('app.current_user_id', true);"))
            setting_val = res2.scalar()
            assert setting_val is None or setting_val == ""
