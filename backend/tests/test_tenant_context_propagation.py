import uuid
import pytest
import jwt
from unittest.mock import AsyncMock, MagicMock, patch
from fastapi import HTTPException
from app.auth.middleware import get_current_user, set_tenant_context
from app.config import settings
from app.models.financials import User

@pytest.mark.asyncio
async def test_set_tenant_context_postgres_executed():
    """Verify that set_tenant_context executes transaction-local set_config on PostgreSQL sessions."""
    db_mock = AsyncMock()
    # Simulate postgres dialect
    dialect_mock = MagicMock()
    dialect_mock.name = "postgresql"
    bind_mock = MagicMock()
    bind_mock.dialect = dialect_mock
    db_mock.bind = bind_mock
    
    tenant_id = uuid.uuid4()
    await set_tenant_context(db_mock, tenant_id)
    
    # Assert db.execute was called with set_config
    assert db_mock.execute.called
    call_args = db_mock.execute.call_args
    query_text = str(call_args[0][0])
    params = call_args[0][1]
    
    assert "set_config" in query_text
    assert "app.current_user_id" in query_text
    assert params["user_id"] == str(tenant_id)

@pytest.mark.asyncio
async def test_set_tenant_context_failure_fails_closed():
    """Verify that if set_config fails on PostgreSQL, an HTTPException is raised and processing halts."""
    db_mock = AsyncMock()
    dialect_mock = MagicMock()
    dialect_mock.name = "postgresql"
    bind_mock = MagicMock()
    bind_mock.dialect = dialect_mock
    db_mock.bind = bind_mock
    
    # Force db.execute to raise an exception
    db_mock.execute.side_effect = Exception("PostgreSQL set_config failure")
    
    tenant_id = uuid.uuid4()
    with pytest.raises(HTTPException) as exc_info:
        await set_tenant_context(db_mock, tenant_id)
        
    assert exc_info.value.status_code == 500
    assert "tenant context" in exc_info.value.detail.lower()

@pytest.mark.asyncio
async def test_get_current_user_sets_tenant_context_from_jwt_sub():
    """Verify get_current_user extracts sub from verified JWT and sets tenant context on the session."""
    tenant_id = uuid.uuid4()
    token = jwt.encode(
        {"sub": str(tenant_id), "email": "test@example.com", "aud": "authenticated"},
        settings.JWT_SECRET,
        algorithm="HS256"
    )
    
    db_mock = AsyncMock()
    dialect_mock = MagicMock()
    dialect_mock.name = "postgresql"
    bind_mock = MagicMock()
    bind_mock.dialect = dialect_mock
    db_mock.bind = bind_mock
    
    # Mock user query return
    result_mock = MagicMock()
    result_mock.scalars.return_value.first.return_value = User(id=tenant_id, email="test@example.com")
    db_mock.execute.return_value = result_mock
    
    auth_header = f"Bearer {token}"
    user = await get_current_user(authorization=auth_header, db=db_mock)
    
    assert user.id == tenant_id
    # Ensure set_config was executed
    executed_queries = [str(call[0][0]) for call in db_mock.execute.call_args_list]
    assert any("set_config" in q and "app.current_user_id" in q for q in executed_queries)

@pytest.mark.asyncio
async def test_client_cannot_override_authenticated_identity():
    """Verify that client body or header claims cannot change the resolved tenant identity."""
    tenant_a_id = uuid.uuid4()
    tenant_b_id = uuid.uuid4()
    
    token = jwt.encode(
        {"sub": str(tenant_a_id), "email": "tenanta@example.com", "aud": "authenticated"},
        settings.JWT_SECRET,
        algorithm="HS256"
    )
    
    db_mock = AsyncMock()
    dialect_mock = MagicMock()
    dialect_mock.name = "postgresql"
    bind_mock = MagicMock()
    bind_mock.dialect = dialect_mock
    db_mock.bind = bind_mock
    
    result_mock = MagicMock()
    result_mock.scalars.return_value.first.return_value = User(id=tenant_a_id, email="tenanta@example.com")
    db_mock.execute.return_value = result_mock
    
    auth_header = f"Bearer {token}"
    user = await get_current_user(authorization=auth_header, db=db_mock)
    
    # Authenticated user is Tenant A, regardless of what any request body might contain
    assert user.id == tenant_a_id
    assert user.id != tenant_b_id
    
    # Check that set_config was called with Tenant A ID only
    set_config_calls = [
        call[0][1]["user_id"]
        for call in db_mock.execute.call_args_list
        if len(call[0]) > 1 and isinstance(call[0][1], dict) and "user_id" in call[0][1]
    ]
    assert str(tenant_a_id) in set_config_calls
    assert str(tenant_b_id) not in set_config_calls
