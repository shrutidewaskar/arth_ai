import jwt
import logging
from fastapi import Header, HTTPException, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import text
from app.config import settings
from app.database import get_db
from app.models.financials import User
from uuid import UUID

logger = logging.getLogger(__name__)

async def set_tenant_context(db: AsyncSession, user_id: UUID) -> None:
    """
    Sets the transaction-local PostgreSQL tenant identity 'app.current_user_id'.
    Fails closed if the database execution fails on PostgreSQL.
    """
    bind = db.bind
    dialect_name = bind.dialect.name if bind else ""
    
    # In PostgreSQL (or asyncpg/psycopg), switch to non-bypass application role and set transaction-local configuration
    if "postgres" in dialect_name or "asyncpg" in dialect_name:
        try:
            await db.execute(
                text("SELECT set_config('app.current_user_id', :user_id, true);"),
                {"user_id": str(user_id)}
            )
        except Exception as e:
            logger.error(f"Failed to set database tenant context: {e}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to establish secure tenant context."
            )

async def get_current_user(
    authorization: str = Header(None),
    db: AsyncSession = Depends(get_db)
) -> User:
    if not authorization:
        if settings.ARTHAI_DEV_AUTH_FALLBACK:
            # For development/sandbox fallback, we provide a default seed user
            # so testing without JWT headers works seamlessly.
            default_user_email = "shruti@arthai.com"
            result = await db.execute(select(User).filter(User.email == default_user_email))
            user = result.scalars().first()
            if not user:
                user = User(email=default_user_email, full_name="Shruti Dewaskar")
                db.add(user)
                await db.flush()
                # Commit handled by session dependency block
            
            # Establish transaction-local tenant context
            await set_tenant_context(db, user.id)
            return user
        else:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Authorization header missing"
            )
        
    try:
        scheme, token = authorization.split(" ")
        if scheme.lower() != "bearer":
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid authentication scheme"
            )
            
        # Decode the token using secret key
        # Supabase defaults to HS256 with JWT secret
        payload = jwt.decode(
            token, 
            settings.JWT_SECRET, 
            algorithms=["HS256"], 
            audience="authenticated"
        )
        
        user_id = payload.get("sub")
        email = payload.get("email")
        if not user_id or not email:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token payload claims"
            )
            
        uuid_user_id = UUID(user_id)
        
        # 1. Establish tenant context immediately from verified JWT sub
        # so that querying/inserting into the RLS-protected users table succeeds.
        await set_tenant_context(db, uuid_user_id)
        
        # 2. Verify or sync user in database
        result = await db.execute(select(User).filter(User.id == uuid_user_id))
        user = result.scalars().first()
        if not user:
            user = User(id=uuid_user_id, email=email, full_name=payload.get("user_metadata", {}).get("full_name"))
            db.add(user)
            await db.flush()
            
        return user
        
    except jwt.PyJWTError as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Token verification failed: {str(e)}"
        )
    except HTTPException:
        raise
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Authentication processing error"
        )

