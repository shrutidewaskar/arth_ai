from pydantic_settings import BaseSettings
from pydantic import Field
from typing import List, Union

class Settings(BaseSettings):
    PROJECT_NAME: str = "ArthAI API"
    API_V1_STR: str = "/api/v1"
    
    # Database
    DATABASE_URL: str = Field(
        default="postgresql+asyncpg://postgres:postgres@localhost:5432/postgres",
        validation_alias="DATABASE_URL"
    )
    
    # AI Engine
    OPENAI_API_KEY: str = Field(default="sk-dummy-key", validation_alias="OPENAI_API_KEY")
    
    # Supabase
    SUPABASE_URL: str = Field(default="https://example.supabase.co", validation_alias="SUPABASE_URL")
    SUPABASE_ANON_KEY: str = Field(default="dummy-anon-key", validation_alias="SUPABASE_ANON_KEY")
    SUPABASE_SERVICE_ROLE_KEY: str = Field(default="dummy-service-role-key", validation_alias="SUPABASE_SERVICE_ROLE_KEY")
    
    # JWT & Auth
    JWT_SECRET: str = Field(default="dummy-jwt-secret-for-fallback", validation_alias="JWT_SECRET")
    
    # CORS
    BACKEND_CORS_ORIGINS: Union[str, List[str]] = ["http://localhost:3000", "http://127.0.0.1:3000"]

    class Config:
        case_sensitive = True
        env_file = ".env"
        extra = "ignore"

settings = Settings()
