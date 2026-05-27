from datetime import datetime, timezone
from typing import Optional, List
from sqlalchemy import String, Integer, Boolean, DateTime, ForeignKey, Numeric, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.core.database import Base

class Tournament(Base):
    __tablename__ = "tournaments"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    title: Mapped[str] = mapped_column(String(150))
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    
    entry_fee: Mapped[float] = mapped_column(Numeric(15, 2), default=0.00)
    prize_pool: Mapped[float] = mapped_column(Numeric(15, 2))
    
    starts_at: Mapped[datetime] = mapped_column(DateTime)
    ends_at: Mapped[datetime] = mapped_column(DateTime)
    
    max_participants: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    current_participants: Mapped[int] = mapped_column(Integer, default=0)
    
    # upcoming, active, completed, cancelled
    status: Mapped[str] = mapped_column(String(20), default="upcoming", index=True)
    
    created_at: Mapped[datetime] = mapped_column(DateTime, default=lambda: datetime.now(timezone.utc))

    participants: Mapped[List["TournamentParticipant"]] = relationship("TournamentParticipant", back_populates="tournament", cascade="all, delete-orphan")

class TournamentParticipant(Base):
    __tablename__ = "tournament_participants"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    tournament_id: Mapped[int] = mapped_column(Integer, ForeignKey("tournaments.id", ondelete="CASCADE"), index=True)
    user_id: Mapped[int] = mapped_column(Integer, ForeignKey("users.id", ondelete="CASCADE"), index=True)
    
    score: Mapped[float] = mapped_column(Numeric(15, 2), default=0.00)
    rank: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    
    joined_at: Mapped[datetime] = mapped_column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    tournament: Mapped["Tournament"] = relationship("Tournament", back_populates="participants")

class Leaderboard(Base):
    __tablename__ = "leaderboards"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    
    # daily, weekly, monthly, all_time
    type: Mapped[str] = mapped_column(String(20), index=True)
    date_reference: Mapped[str] = mapped_column(String(30), index=True)  # "2026-05-19" or "2026-W20"
    
    user_id: Mapped[int] = mapped_column(Integer, ForeignKey("users.id", ondelete="CASCADE"), index=True)
    rank: Mapped[int] = mapped_column(Integer)
    score: Mapped[float] = mapped_column(Numeric(15, 2))  # total winnings or wagering amount
    
    created_at: Mapped[datetime] = mapped_column(DateTime, default=lambda: datetime.now(timezone.utc))
