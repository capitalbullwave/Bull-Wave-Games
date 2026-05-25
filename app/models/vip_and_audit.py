from datetime import datetime, timezone
from typing import Optional
from sqlalchemy import String, Integer, DateTime, ForeignKey, Numeric, Text
from sqlalchemy.orm import Mapped, mapped_column
from app.core.database import Base

class VIPLevel(Base):
    __tablename__ = "vip_levels"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    level_name: Mapped[str] = mapped_column(String(50), unique=True)
    level_number: Mapped[int] = mapped_column(Integer, unique=True, index=True)  # 0, 1, 2, 3, etc.
    
    min_wager: Mapped[float] = mapped_column(Numeric(15, 2))  # Lifetime wager required
    min_deposit: Mapped[float] = mapped_column(Numeric(15, 2))  # Lifetime deposit required
    
    daily_withdrawal_limit: Mapped[float] = mapped_column(Numeric(15, 2))
    monthly_bonus: Mapped[float] = mapped_column(Numeric(15, 2), default=0.00)
    referral_bonus_rate: Mapped[float] = mapped_column(Numeric(5, 4), default=0.0000)  # Extra multiplier for referrals
    
    created_at: Mapped[datetime] = mapped_column(DateTime, default=lambda: datetime.now(timezone.utc))

class AuditLog(Base):
    __tablename__ = "audit_logs"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    user_id: Mapped[Optional[int]] = mapped_column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True, index=True)
    
    # login, change_password, update_profile, kyc_change, wallet_freeze, admin_override
    action: Mapped[str] = mapped_column(String(100), index=True)
    ip_address: Mapped[Optional[str]] = mapped_column(String(45), nullable=True)
    details: Mapped[Optional[str]] = mapped_column(Text, nullable=True)  # JSON metadata representation
    
    created_at: Mapped[datetime] = mapped_column(DateTime, default=lambda: datetime.now(timezone.utc))
