from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import Field, AliasChoices
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
    SUPABASE_URL: str = Field(
        default="https://example.supabase.co",
        validation_alias=AliasChoices("SUPABASE_URL", "NEXT_PUBLIC_SUPABASE_URL")
    )
    SUPABASE_ANON_KEY: str = Field(
        default="dummy-anon-key",
        validation_alias=AliasChoices("SUPABASE_ANON_KEY", "NEXT_PUBLIC_SUPABASE_ANON_KEY")
    )
    SUPABASE_SERVICE_ROLE_KEY: str = Field(
        default="dummy-service-role-key",
        validation_alias="SUPABASE_SERVICE_ROLE_KEY"
    )
    
    # JWT & Auth
    JWT_SECRET: str = Field(default="dummy-jwt-secret-for-fallback", validation_alias="JWT_SECRET")
    
    # CORS
    BACKEND_CORS_ORIGINS: Union[str, List[str]] = Field(
        default=["http://localhost:3000", "http://127.0.0.1:3000"],
        validation_alias="BACKEND_CORS_ORIGINS"
    )

    model_config = SettingsConfigDict(
        case_sensitive=True,
        env_file=(".env", ".env.local"),
        env_file_encoding="utf-8",
        extra="ignore"
    )

settings = Settings()

