from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime

class WalletSummaryResponse(BaseModel):
    total_deposit: float
    total_withdraw: float
    total_bonus: float
    total_bets: float
    total_wins: float

class WalletResponse(BaseModel):
    main_balance: float
    bonus_balance: float
    winning_balance: float
    referral_balance: float
    is_frozen: bool

    class Config:
        from_attributes = True

class DepositInitiate(BaseModel):
    amount: float = Field(..., gt=0)
    gateway: str = Field("razorpay", description="razorpay, cashfree, manual")

class DepositResponse(BaseModel):
    id: int
    amount: float
    gateway: str
    status: str
    gateway_tx_id: Optional[str] = None
    checkout_url: Optional[str] = None  # Redirect client to gateway checkout UI
    razorpay_key_id: Optional[str] = None
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class PaymentVerifyRequest(BaseModel):
    deposit_id: int
    payment_id: str
    order_id: str
    signature: str


class WithdrawalCreate(BaseModel):
    amount: float = Field(..., gt=0)
    bank_account_id: int

class WithdrawalResponse(BaseModel):
    id: int
    amount: float
    status: str
    rejection_reason: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True

class TransferRequest(BaseModel):
    amount: float = Field(..., gt=0)
    # referral -> main, winning -> main
    source_wallet: str = Field(..., description="referral or winning")
    target_wallet: str = Field("main", description="must be 'main'")

class WalletTransactionResponse(BaseModel):
    id: int
    amount: float
    wallet_type: str
    transaction_type: str
    reference_id: Optional[str] = None
    description: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True

class TransactionListResponse(BaseModel):
    items: List[WalletTransactionResponse]
    total: int
    page: int
    size: int

class DepositListResponse(BaseModel):
    items: List[DepositResponse]
    total: int
    page: int
    size: int

class WithdrawalListResponse(BaseModel):
    items: List[WithdrawalResponse]
    total: int
    page: int
    size: int

class WithdrawalActionRequest(BaseModel):
    withdrawal_id: int
    reason: Optional[str] = None


