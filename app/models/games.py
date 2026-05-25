from datetime import datetime, timezone
from typing import Optional, List
from sqlalchemy import String, Integer, Boolean, DateTime, ForeignKey, Numeric, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.core.database import Base

class GameCategory(Base):
    __tablename__ = "game_categories"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    name: Mapped[str] = mapped_column(String(100), unique=True)
    slug: Mapped[str] = mapped_column(String(100), unique=True, index=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    
    created_at: Mapped[datetime] = mapped_column(DateTime, default=lambda: datetime.now(timezone.utc))

    games: Mapped[List["Game"]] = relationship("Game", back_populates="category")

class Game(Base):
    __tablename__ = "games"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    category_id: Mapped[int] = mapped_column(Integer, ForeignKey("game_categories.id", ondelete="RESTRICT"), index=True)
    name: Mapped[str] = mapped_column(String(100))
    provider: Mapped[str] = mapped_column(String(50))  # internal, custom, evolution, pragmatic, etc.
    provider_game_id: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    thumbnail_url: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    
    created_at: Mapped[datetime] = mapped_column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    category: Mapped["GameCategory"] = relationship("GameCategory", back_populates="games")
    sessions: Mapped[List["GameSession"]] = relationship("GameSession", back_populates="game")

class GameSession(Base):
    __tablename__ = "game_sessions"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    user_id: Mapped[int] = mapped_column(Integer, ForeignKey("users.id", ondelete="CASCADE"), index=True)
    game_id: Mapped[int] = mapped_column(Integer, ForeignKey("games.id", ondelete="CASCADE"), index=True)
    session_token: Mapped[str] = mapped_column(String(255), unique=True, index=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    
    created_at: Mapped[datetime] = mapped_column(DateTime, default=lambda: datetime.now(timezone.utc))
    closed_at: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)

    game: Mapped["Game"] = relationship("Game", back_populates="sessions")
    bets: Mapped[List["Bet"]] = relationship("Bet", back_populates="session")

class Bet(Base):
    __tablename__ = "bets"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    user_id: Mapped[int] = mapped_column(Integer, ForeignKey("users.id", ondelete="CASCADE"), index=True)
    game_id: Mapped[int] = mapped_column(Integer, ForeignKey("games.id", ondelete="CASCADE"), index=True)
    game_session_id: Mapped[Optional[int]] = mapped_column(Integer, ForeignKey("game_sessions.id", ondelete="SET NULL"), nullable=True, index=True)
    
    bet_amount: Mapped[float] = mapped_column(Numeric(15, 2))
    wallet_type: Mapped[str] = mapped_column(String(20))  # main, bonus, winning
    prediction: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    
    # pending, won, lost, refunded
    status: Mapped[str] = mapped_column(String(20), default="pending", index=True)
    payout_amount: Mapped[float] = mapped_column(Numeric(15, 2), default=0.00)
    
    created_at: Mapped[datetime] = mapped_column(DateTime, default=lambda: datetime.now(timezone.utc))
    settled_at: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)

    session: Mapped[Optional["GameSession"]] = relationship("GameSession", back_populates="bets")

class Result(Base):
    __tablename__ = "results"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    game_id: Mapped[int] = mapped_column(Integer, ForeignKey("games.id", ondelete="CASCADE"), index=True)
    period_no: Mapped[Optional[str]] = mapped_column(String(100), nullable=True, index=True)  # Useful for lottery/crash rounds
    result_data: Mapped[str] = mapped_column(Text)  # JSON or plain string representation of game results (e.g., color, number)
    
    created_at: Mapped[datetime] = mapped_column(DateTime, default=lambda: datetime.now(timezone.utc))
