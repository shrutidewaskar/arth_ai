import jwt
from fastapi import Header, HTTPException, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from app.config import settings
from app.database import get_db
from app.models.financials import User
from uuid import UUID

async def get_current_user(
    authorization: str = Header(None),
    db: AsyncSession = Depends(get_db)
) -> User:
    if not authorization:
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
        return user
        
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
        
        # Verify or sync user in local database
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
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Authentication error: {str(e)}"
        )
