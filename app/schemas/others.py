from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime

class ReferralResponse(BaseModel):
    direct_referrals_count: int
    total_commissions: float
    referral_code: str
    referral_link: str

class CommissionResponse(BaseModel):
    id: int
    referee_username: str
    commission_amount: float
    level: int
    status: str
    created_at: datetime

    class Config:
        from_attributes = True

class RewardResponse(BaseModel):
    id: int
    type: str
    amount: float
    status: str
    details: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True

class CouponClaimRequest(BaseModel):
    code: str

class NotificationResponse(BaseModel):
    id: int
    title: str
    message: str
    type: str
    is_read: bool
    created_at: datetime

    class Config:
        from_attributes = True

class SupportTicketCreate(BaseModel):
    subject: str = Field(..., min_length=5, max_length=200)
    message: str = Field(..., min_length=10)
    priority: str = Field("medium", description="low, medium, high, critical")

class TicketMessageResponse(BaseModel):
    id: int
    ticket_id: int
    sender_id: int
    sender_username: str
    message: str
    attachment_url: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True

class SupportTicketResponse(BaseModel):
    id: int
    subject: str
    status: str
    priority: str
    created_at: datetime
    updated_at: datetime
    messages: List[TicketMessageResponse] = []

    class Config:
        from_attributes = True

class TicketMessageCreate(BaseModel):
    message: str = Field(..., min_length=1)
    attachment_url: Optional[str] = None

class VIPLevelResponse(BaseModel):
    id: int
    level_name: str
    level_number: int
    min_wager: float
    min_deposit: float
    daily_withdrawal_limit: float
    monthly_bonus: float
    referral_bonus_rate: float

    class Config:
        from_attributes = True
