from datetime import datetime, timezone
from typing import Optional
from sqlalchemy import String, Integer, DateTime, ForeignKey, Numeric, Boolean
from sqlalchemy.orm import Mapped, mapped_column
from app.core.database import Base

class Referral(Base):
    __tablename__ = "referrals"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    referrer_id: Mapped[int] = mapped_column(Integer, ForeignKey("users.id", ondelete="CASCADE"), index=True)
    referee_id: Mapped[int] = mapped_column(Integer, ForeignKey("users.id", ondelete="CASCADE"), unique=True, index=True)
    
    # Tier level representation: 1 = direct referral, 2 = level 2 (indirect), 3 = level 3
    level: Mapped[int] = mapped_column(Integer, default=1)
    
    first_deposit_amount: Mapped[float] = mapped_column(Numeric(15, 2), default=0.00)
    first_deposit_completed: Mapped[bool] = mapped_column(Boolean, default=False)
    status: Mapped[str] = mapped_column(String(20), default="pending")  # pending, completed
    
    created_at: Mapped[datetime] = mapped_column(DateTime, default=lambda: datetime.now(timezone.utc))

class ReferralCommission(Base):
    __tablename__ = "referral_commissions"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    referrer_id: Mapped[int] = mapped_column(Integer, ForeignKey("users.id", ondelete="CASCADE"), index=True)
    referee_id: Mapped[int] = mapped_column(Integer, ForeignKey("users.id", ondelete="CASCADE"), index=True)
    
    commission_amount: Mapped[float] = mapped_column(Numeric(15, 2))
    level: Mapped[int] = mapped_column(Integer)
    
    bet_id: Mapped[Optional[int]] = mapped_column(Integer, ForeignKey("bets.id", ondelete="SET NULL"), nullable=True, index=True)
    deposit_id: Mapped[Optional[int]] = mapped_column(Integer, ForeignKey("deposits.id", ondelete="SET NULL"), nullable=True, index=True)
    
    # pending, paid
    status: Mapped[str] = mapped_column(String(20), default="pending", index=True)
    
    created_at: Mapped[datetime] = mapped_column(DateTime, default=lambda: datetime.now(timezone.utc))
