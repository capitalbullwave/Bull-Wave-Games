from datetime import datetime, timezone
from typing import Optional
from sqlalchemy import String, Integer, Boolean, DateTime, ForeignKey, Numeric, Text
from sqlalchemy.orm import Mapped, mapped_column
from app.core.database import Base

class Reward(Base):
    __tablename__ = "rewards"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    user_id: Mapped[int] = mapped_column(Integer, ForeignKey("users.id", ondelete="CASCADE"), index=True)
    
    # daily_checkin, deposit_bonus, coupon_claim, spin_wheel, wager_milestone
    type: Mapped[str] = mapped_column(String(50), index=True)
    amount: Mapped[float] = mapped_column(Numeric(15, 2))
    
    # pending, claimed
    status: Mapped[str] = mapped_column(String(20), default="claimed", index=True)
    details: Mapped[Optional[str]] = mapped_column(Text, nullable=True)  # Custom description / JSON context
    
    created_at: Mapped[datetime] = mapped_column(DateTime, default=lambda: datetime.now(timezone.utc))

class Coupon(Base):
    __tablename__ = "coupons"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    code: Mapped[str] = mapped_column(String(50), unique=True, index=True)
    
    # bonus_percentage, flat_cash
    reward_type: Mapped[str] = mapped_column(String(30))
    value: Mapped[float] = mapped_column(Numeric(15, 2))
    
    min_deposit: Mapped[float] = mapped_column(Numeric(15, 2), default=0.00)
    max_limit: Mapped[float] = mapped_column(Numeric(15, 2), default=0.00)  # Max bonus possible
    
    expires_at: Mapped[datetime] = mapped_column(DateTime)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    
    usage_limit: Mapped[int] = mapped_column(Integer, default=1)
    current_usage: Mapped[int] = mapped_column(Integer, default=0)
    
    created_at: Mapped[datetime] = mapped_column(DateTime, default=lambda: datetime.now(timezone.utc))
