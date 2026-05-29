from datetime import datetime, timezone
from typing import Optional
from sqlalchemy import String, Integer, Boolean, DateTime, ForeignKey, Numeric
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.core.database import Base

class InvitationBonusLevel(Base):
    __tablename__ = "invitation_bonus_levels"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    level: Mapped[int] = mapped_column(Integer, unique=True, index=True)
    required_invites: Mapped[int] = mapped_column(Integer)
    required_deposit_amount: Mapped[float] = mapped_column(Numeric(15, 2))
    reward_amount: Mapped[float] = mapped_column(Numeric(15, 2))
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)

    created_at: Mapped[datetime] = mapped_column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

class UserInvitationProgress(Base):
    __tablename__ = "user_invitation_progress"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    user_id: Mapped[int] = mapped_column(Integer, ForeignKey("users.id", ondelete="CASCADE"), index=True)
    level_id: Mapped[int] = mapped_column(Integer, ForeignKey("invitation_bonus_levels.id", ondelete="CASCADE"), index=True)
    
    completed_invites: Mapped[int] = mapped_column(Integer, default=0)
    completed_deposits: Mapped[int] = mapped_column(Integer, default=0)
    
    reward_unlocked: Mapped[bool] = mapped_column(Boolean, default=False)
    reward_claimed: Mapped[bool] = mapped_column(Boolean, default=False)
    claimed_at: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)

    created_at: Mapped[datetime] = mapped_column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    user: Mapped["User"] = relationship("User")
    level: Mapped["InvitationBonusLevel"] = relationship("InvitationBonusLevel")

class InvitationRewardHistory(Base):
    __tablename__ = "invitation_reward_history"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    user_id: Mapped[int] = mapped_column(Integer, ForeignKey("users.id", ondelete="CASCADE"), index=True)
    level_id: Mapped[int] = mapped_column(Integer, ForeignKey("invitation_bonus_levels.id", ondelete="SET NULL"), nullable=True)
    
    amount: Mapped[float] = mapped_column(Numeric(15, 2))
    claimed_at: Mapped[datetime] = mapped_column(DateTime, default=lambda: datetime.now(timezone.utc))

    user: Mapped["User"] = relationship("User")
    level: Mapped["InvitationBonusLevel"] = relationship("InvitationBonusLevel")
