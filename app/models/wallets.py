from datetime import datetime, timezone
from typing import Optional
from sqlalchemy import String, Integer, Boolean, DateTime, ForeignKey, Numeric, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.core.database import Base

class Wallet(Base):
    __tablename__ = "wallets"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    user_id: Mapped[int] = mapped_column(Integer, ForeignKey("users.id", ondelete="CASCADE"), unique=True, index=True)
    
    # Financial Balances (using Numeric/Float for transaction precision)
    main_balance: Mapped[float] = mapped_column(Numeric(15, 2), default=0.00)
    bonus_balance: Mapped[float] = mapped_column(Numeric(15, 2), default=0.00)
    winning_balance: Mapped[float] = mapped_column(Numeric(15, 2), default=0.00)
    referral_balance: Mapped[float] = mapped_column(Numeric(15, 2), default=0.00)
    
    is_frozen: Mapped[bool] = mapped_column(Boolean, default=False)
    
    created_at: Mapped[datetime] = mapped_column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    user: Mapped["User"] = relationship("User", back_populates="wallet")
    transactions: Mapped[list["WalletTransaction"]] = relationship("WalletTransaction", back_populates="wallet", cascade="all, delete-orphan")

class WalletTransaction(Base):
    __tablename__ = "wallet_transactions"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    wallet_id: Mapped[int] = mapped_column(Integer, ForeignKey("wallets.id", ondelete="CASCADE"), index=True)
    
    amount: Mapped[float] = mapped_column(Numeric(15, 2))
    
    # main, bonus, winning, referral
    wallet_type: Mapped[str] = mapped_column(String(20)) 
    
    # deposit, withdraw, bet_placed, game_won, referral_commission, bonus_credit, cashback, refund, transfer_in, transfer_out
    transaction_type: Mapped[str] = mapped_column(String(50))
    
    reference_id: Mapped[Optional[str]] = mapped_column(String(100), nullable=True, index=True)
    description: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    
    created_at: Mapped[datetime] = mapped_column(DateTime, default=lambda: datetime.now(timezone.utc))

    wallet: Mapped["Wallet"] = relationship("Wallet", back_populates="transactions")

class Deposit(Base):
    __tablename__ = "deposits"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    user_id: Mapped[int] = mapped_column(Integer, ForeignKey("users.id", ondelete="CASCADE"), index=True)
    
    amount: Mapped[float] = mapped_column(Numeric(15, 2))
    gateway: Mapped[str] = mapped_column(String(50))  # razorpay, cashfree, upi, manual
    gateway_tx_id: Mapped[Optional[str]] = mapped_column(String(100), unique=True, index=True, nullable=True)
    
    # pending, completed, failed
    status: Mapped[str] = mapped_column(String(20), default="pending", index=True)
    payload: Mapped[Optional[str]] = mapped_column(Text, nullable=True)  # Raw JSON gateway response
    
    created_at: Mapped[datetime] = mapped_column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

class Withdrawal(Base):
    __tablename__ = "withdrawals"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    user_id: Mapped[int] = mapped_column(Integer, ForeignKey("users.id", ondelete="CASCADE"), index=True)
    bank_account_id: Mapped[int] = mapped_column(Integer, ForeignKey("bank_accounts.id", ondelete="RESTRICT"))
    
    amount: Mapped[float] = mapped_column(Numeric(15, 2))
    
    # pending, approved, rejected, processing, completed, failed
    status: Mapped[str] = mapped_column(String(20), default="pending", index=True)
    rejection_reason: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    
    processed_at: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

class PaymentLog(Base):
    __tablename__ = "payment_logs"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    event_type: Mapped[str] = mapped_column(String(100))  # webhook, payout, verification
    gateway: Mapped[str] = mapped_column(String(50))
    payload: Mapped[str] = mapped_column(Text)
    status: Mapped[str] = mapped_column(String(20))
    
    created_at: Mapped[datetime] = mapped_column(DateTime, default=lambda: datetime.now(timezone.utc))
