from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import text
from app.config import settings
from app.database import get_db
from app.api.endpoints import router as api_router

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="ArthAI API - The AI Financial Operating System for the Indian Middle Class",
    version="0.1.0"
)

# Set CORS middleware
origins = []
if isinstance(settings.BACKEND_CORS_ORIGINS, str):
    origins = [origin.strip() for origin in settings.BACKEND_CORS_ORIGINS.split(",")]
else:
    origins = settings.BACKEND_CORS_ORIGINS

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register API Router
app.include_router(api_router, prefix=settings.API_V1_STR)

@app.get("/health")
async def health_check(db: AsyncSession = Depends(get_db)):
    try:
        # Check database connectivity
        await db.execute(text("SELECT 1"))
        db_status = "connected"
    except Exception as e:
        db_status = f"error: {str(e)}"
        
    return {
        "status": "healthy",
        "project": settings.PROJECT_NAME,
        "database": db_status
    }

@app.get("/")
def read_root():
    return {
        "message": "Welcome to ArthAI API",
        "philosophy": "Does this help the AI reason better about a family's financial future?"
    }
