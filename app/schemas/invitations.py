from pydantic import BaseModel, ConfigDict
from typing import List, Optional
from datetime import datetime

# --- Base schemas ---

class InvitationBonusLevelBase(BaseModel):
    level: int
    required_invites: int
    required_deposit_amount: float
    reward_amount: float
    is_active: bool = True

class InvitationBonusLevelCreate(InvitationBonusLevelBase):
    pass

class InvitationBonusLevelUpdate(BaseModel):
    level: Optional[int] = None
    required_invites: Optional[int] = None
    required_deposit_amount: Optional[float] = None
    reward_amount: Optional[float] = None
    is_active: Optional[bool] = None

class InvitationBonusLevelResponse(InvitationBonusLevelBase):
    id: int
    created_at: datetime
    updated_at: datetime
    
    model_config = ConfigDict(from_attributes=True)

class UserInvitationProgressResponse(BaseModel):
    id: int
    user_id: int
    level_id: int
    completed_invites: int
    completed_deposits: int
    reward_unlocked: bool
    reward_claimed: bool
    claimed_at: Optional[datetime] = None
    
    level: InvitationBonusLevelResponse
    
    model_config = ConfigDict(from_attributes=True)

class InvitationRewardHistoryResponse(BaseModel):
    id: int
    amount: float
    claimed_at: datetime
    level: Optional[InvitationBonusLevelResponse] = None
    
    model_config = ConfigDict(from_attributes=True)

class ReferralLinkResponse(BaseModel):
    referralCode: str
    referralLink: str

class ClaimRewardResponse(BaseModel):
    success: bool
    message: str
    amount: float

class InvitationStatsResponse(BaseModel):
    total_invites: int
    total_completed_deposits: int
    total_rewards_claimed: float
