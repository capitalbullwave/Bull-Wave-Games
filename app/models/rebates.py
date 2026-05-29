from datetime import datetime, timezone
from typing import Optional, List
from sqlalchemy import String, Integer, Boolean, DateTime, ForeignKey, Numeric
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.core.database import Base

class RebateCategory(Base):
    __tablename__ = "rebate_categories"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    name: Mapped[str] = mapped_column(String(50), unique=True)
    code: Mapped[str] = mapped_column(String(50), unique=True, index=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    
    created_at: Mapped[datetime] = mapped_column(DateTime, default=lambda: datetime.now(timezone.utc))

class VIPRebateRate(Base):
    __tablename__ = "vip_rebate_rates"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    vip_level_id: Mapped[int] = mapped_column(Integer, ForeignKey("vip_levels.id", ondelete="CASCADE"), index=True)
    category_id: Mapped[int] = mapped_column(Integer, ForeignKey("rebate_categories.id", ondelete="CASCADE"), index=True)
    
    rebate_percentage: Mapped[float] = mapped_column(Numeric(5, 2))  # e.g., 0.50 for 0.5%
    
    created_at: Mapped[datetime] = mapped_column(DateTime, default=lambda: datetime.now(timezone.utc))

    vip_level: Mapped["VIPLevel"] = relationship("VIPLevel")
    category: Mapped["RebateCategory"] = relationship("RebateCategory")

class UserRebateBalance(Base):
    __tablename__ = "user_rebate_balance"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    user_id: Mapped[int] = mapped_column(Integer, ForeignKey("users.id", ondelete="CASCADE"), index=True)
    category_id: Mapped[int] = mapped_column(Integer, ForeignKey("rebate_categories.id", ondelete="CASCADE"), index=True)
    
    today_turnover: Mapped[float] = mapped_column(Numeric(15, 2), default=0.00)
    today_rebate: Mapped[float] = mapped_column(Numeric(15, 2), default=0.00)
    total_rebate: Mapped[float] = mapped_column(Numeric(15, 2), default=0.00)
    available_rebate: Mapped[float] = mapped_column(Numeric(15, 2), default=0.00)
    
    last_updated: Mapped[datetime] = mapped_column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    user: Mapped["User"] = relationship("User")
    category: Mapped["RebateCategory"] = relationship("RebateCategory")

class RebateTransaction(Base):
    __tablename__ = "rebate_transactions"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    user_id: Mapped[int] = mapped_column(Integer, ForeignKey("users.id", ondelete="CASCADE"), index=True)
    category_id: Mapped[int] = mapped_column(Integer, ForeignKey("rebate_categories.id", ondelete="CASCADE"), index=True)
    
    bet_amount: Mapped[float] = mapped_column(Numeric(15, 2))
    rebate_percentage: Mapped[float] = mapped_column(Numeric(5, 2))
    rebate_amount: Mapped[float] = mapped_column(Numeric(15, 2))
    
    created_at: Mapped[datetime] = mapped_column(DateTime, default=lambda: datetime.now(timezone.utc))

class RebateClaimHistory(Base):
    __tablename__ = "rebate_claim_history"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    user_id: Mapped[int] = mapped_column(Integer, ForeignKey("users.id", ondelete="CASCADE"), index=True)
    
    amount: Mapped[float] = mapped_column(Numeric(15, 2))
    status: Mapped[str] = mapped_column(String(20), default="completed")
    
    claimed_at: Mapped[datetime] = mapped_column(DateTime, default=lambda: datetime.now(timezone.utc))

    user: Mapped["User"] = relationship("User")
