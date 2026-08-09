import os
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy.orm import declarative_base

DATABASE_URL = os.getenv("DATABASE_URL", "postgresql+asyncpg://postgres:postgres@localhost:5432/postgres")

# Fallback to local SQLite if remote is suspected down or configured as local
if "example.supabase.co" in DATABASE_URL or "[qszgfpeqmkdqbjbacrol]" in DATABASE_URL or "qszgfpeqmkdqbjbacrol" in DATABASE_URL:
    DATABASE_URL = "sqlite+aiosqlite:///C:\\shruti_materials\\Projects\\ArthAI\\backend\\local_test.db"

# Convert standard postgresql:// to postgresql+asyncpg:// if needed
if DATABASE_URL.startswith("postgresql://"):
    DATABASE_URL = DATABASE_URL.replace("postgresql://", "postgresql+asyncpg://", 1)

engine = create_async_engine(DATABASE_URL, echo=True)

AsyncSessionLocal = async_sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False,
)

Base = declarative_base()

async def get_db():
    async with AsyncSessionLocal() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()
