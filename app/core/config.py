from typing import Any, Dict, List, Optional
from pydantic import AnyHttpUrl, BeforeValidator, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict
import os

class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), ".env"),
        env_ignore_empty=True,
        extra="ignore"
    )

    API_V1_STR: str = "/api/v1"
    PROJECT_NAME: str = "Bull Wave Games API"
    
    # Security
    SECRET_KEY: str = "super_secret_jwt_signing_key_bull_wave_games_123!"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # 1 day
    REFRESH_TOKEN_EXPIRE_DAYS: int = 30
    OTP_EXPIRE_MINUTES: int = 5
    FAILED_LOGIN_LIMIT: int = 5
    LOCKOUT_DURATION_MINUTES: int = 15

    # Database
    POSTGRES_SERVER: str = "localhost"
    POSTGRES_USER: str = "postgres"
    POSTGRES_PASSWORD: str = "4234"
    POSTGRES_DB: str = "kheladda"
    POSTGRES_PORT: int = 5432
    DATABASE_URL: Optional[str] = None

    @field_validator("DATABASE_URL", mode="before")
    @classmethod
    def assemble_db_url(cls, v: Optional[str], info: Any) -> Any:
        if isinstance(v, str) and v:
            # Ensure it is asyncpg compatible
            if v.startswith("postgresql://"):
                return v.replace("postgresql://", "postgresql+asyncpg://")
            return v
        
        data = info.data
        user = data.get("POSTGRES_USER", "postgres")
        password = data.get("POSTGRES_PASSWORD", "4234")
        server = data.get("POSTGRES_SERVER", "localhost")
        port = data.get("POSTGRES_PORT", 5432)
        db = data.get("POSTGRES_DB", "kheladda")
        return f"postgresql+asyncpg://{user}:{password}@{server}:{port}/{db}"

    # Sync Database URL for Alembic
    SYNC_DATABASE_URL: Optional[str] = None

    @field_validator("SYNC_DATABASE_URL", mode="before")
    @classmethod
    def assemble_sync_db_url(cls, v: Optional[str], info: Any) -> Any:
        if isinstance(v, str) and v:
            if v.startswith("postgresql+asyncpg://"):
                return v.replace("postgresql+asyncpg://", "postgresql://")
            return v
        data = info.data
        user = data.get("POSTGRES_USER", "postgres")
        password = data.get("POSTGRES_PASSWORD", "4234")
        server = data.get("POSTGRES_SERVER", "localhost")
        port = data.get("POSTGRES_PORT", 5432)
        db = data.get("POSTGRES_DB", "kheladda")
        return f"postgresql://{user}:{password}@{server}:{port}/{db}"

    # Redis
    REDIS_URL: str = "redis://localhost:6379/0"

    # AWS S3 Storage
    AWS_ACCESS_KEY_ID: Optional[str] = None
    AWS_SECRET_ACCESS_KEY: Optional[str] = None
    AWS_S3_BUCKET: Optional[str] = "bullwave-assets"
    AWS_S3_ENDPOINT_URL: Optional[str] = None  # e.g., for MinIO or custom s3 compatible

    # Payments
    RAZORPAY_KEY_ID: str = "rzp_test_mockkey"
    RAZORPAY_KEY_SECRET: str = "mocksecret12345"
    RAZORPAY_WEBHOOK_SECRET: str = "mockwebhooksecret"

    CASHFREE_APP_ID: str = "mock_cf_app_id"
    CASHFREE_SECRET_KEY: str = "mock_cf_secret_key"
    CASHFREE_API_VERSION: str = "2022-09-01"

    # MLM Referral System (3 Tiers)
    REFERRAL_COMMISSION_L1: float = 0.05  # 5%
    REFERRAL_COMMISSION_L2: float = 0.03  # 3%
    REFERRAL_COMMISSION_L3: float = 0.01  # 1%

settings = Settings()
