from datetime import datetime, timezone
from typing import List, Optional
from sqlalchemy import String, Integer, DateTime, ForeignKey, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.core.database import Base

class SupportTicket(Base):
    __tablename__ = "support_tickets"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    user_id: Mapped[int] = mapped_column(Integer, ForeignKey("users.id", ondelete="CASCADE"), index=True)
    
    subject: Mapped[str] = mapped_column(String(200))
    
    # open, in_progress, resolved, closed
    status: Mapped[str] = mapped_column(String(20), default="open", index=True)
    
    # low, medium, high, critical
    priority: Mapped[str] = mapped_column(String(20), default="medium")
    
    created_at: Mapped[datetime] = mapped_column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    messages: Mapped[List["TicketMessage"]] = relationship("TicketMessage", back_populates="ticket", cascade="all, delete-orphan")

class TicketMessage(Base):
    __tablename__ = "ticket_messages"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    ticket_id: Mapped[int] = mapped_column(Integer, ForeignKey("support_tickets.id", ondelete="CASCADE"), index=True)
    sender_id: Mapped[int] = mapped_column(Integer, ForeignKey("users.id", ondelete="CASCADE"), index=True)
    
    message: Mapped[str] = mapped_column(Text)
    attachment_url: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    
    created_at: Mapped[datetime] = mapped_column(DateTime, default=lambda: datetime.now(timezone.utc))

    ticket: Mapped["SupportTicket"] = relationship("SupportTicket", back_populates="messages")
