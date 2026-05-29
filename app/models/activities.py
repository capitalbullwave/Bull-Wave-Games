from datetime import datetime
from typing import Optional
from sqlalchemy import String, Float, Boolean, ForeignKey, Integer, DateTime, Enum, text
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.sql import func
import enum

from app.core.database import Base

class ActivityType(str, enum.Enum):
    DAILY = "daily"
    WEEKLY = "weekly"
    MONTHLY = "monthly"

class ActivityTask(Base):
    __tablename__ = "activity_tasks"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[Optional[str]] = mapped_column(String(1000), nullable=True)
    target_amount: Mapped[float] = mapped_column(Float, nullable=False)
    reward_amount: Mapped[float] = mapped_column(Float, nullable=False)
    activity_type: Mapped[ActivityType] = mapped_column(Enum(ActivityType), nullable=False, default=ActivityType.DAILY)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

class UserActivityProgress(Base):
    __tablename__ = "user_activity_progress"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    user_id: Mapped[int] = mapped_column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    task_id: Mapped[int] = mapped_column(Integer, ForeignKey("activity_tasks.id", ondelete="CASCADE"), nullable=False, index=True)
    current_amount: Mapped[float] = mapped_column(Float, default=0.0)
    completed: Mapped[bool] = mapped_column(Boolean, default=False)
    claimed: Mapped[bool] = mapped_column(Boolean, default=False)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    task: Mapped["ActivityTask"] = relationship("ActivityTask")
    user: Mapped["User"] = relationship("User", back_populates="activity_progress")

class ActivityRewardHistory(Base):
    __tablename__ = "activity_reward_history"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    user_id: Mapped[int] = mapped_column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    task_id: Mapped[int] = mapped_column(Integer, ForeignKey("activity_tasks.id", ondelete="CASCADE"), nullable=False)
    reward_amount: Mapped[float] = mapped_column(Float, nullable=False)
    claimed_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    task: Mapped["ActivityTask"] = relationship("ActivityTask")
    user: Mapped["User"] = relationship("User", back_populates="activity_rewards")
