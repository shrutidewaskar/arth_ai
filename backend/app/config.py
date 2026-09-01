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
    LLM_PROVIDER: str = Field(default="openai", validation_alias="LLM_PROVIDER")
    LLM_MODEL: str = Field(default="gpt-4o", validation_alias="LLM_MODEL")
    LLM_FALLBACK_PROVIDER: str = Field(default="groq", validation_alias="LLM_FALLBACK_PROVIDER")
    LLM_FALLBACK_MODEL: str = Field(default="llama3-70b-8192", validation_alias="LLM_FALLBACK_MODEL")
    GEMINI_API_KEY: str = Field(default="sk-dummy-key", validation_alias="GEMINI_API_KEY")
    GROQ_API_KEY: str = Field(default="sk-dummy-key", validation_alias="GROQ_API_KEY")
    OPENROUTER_API_KEY: str = Field(default="sk-dummy-key", validation_alias="OPENROUTER_API_KEY")
    
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
    ARTHAI_DEV_AUTH_FALLBACK: bool = Field(default=False, validation_alias="ARTHAI_DEV_AUTH_FALLBACK")
    
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

