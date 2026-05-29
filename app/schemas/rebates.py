from pydantic import BaseModel, ConfigDict
from typing import List, Optional
from datetime import datetime

# --- Categories ---
class RebateCategoryBase(BaseModel):
    name: str
    code: str
    is_active: bool = True

class RebateCategoryCreate(RebateCategoryBase):
    pass

class RebateCategoryUpdate(BaseModel):
    name: Optional[str] = None
    code: Optional[str] = None
    is_active: Optional[bool] = None

class RebateCategoryResponse(RebateCategoryBase):
    id: int
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)

# --- VIP Rates ---
class VIPRebateRateBase(BaseModel):
    vip_level_id: int
    category_id: int
    rebate_percentage: float

class VIPRebateRateCreate(VIPRebateRateBase):
    pass

class VIPRebateRateResponse(VIPRebateRateBase):
    id: int
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)

# --- User Balances ---
class RebateCategoryStats(BaseModel):
    name: str
    code: str
    turnover: float
    rebate: float
    available_rebate: float

class RebateDashboardResponse(BaseModel):
    availableRebate: float
    todayRebate: float
    totalRebate: float
    vipLevel: int
    categories: List[RebateCategoryStats]

# --- History ---
class RebateHistoryItem(BaseModel):
    amount: float
    category: str
    date: datetime

class RebateClaimHistoryItem(BaseModel):
    id: int
    amount: float
    status: str
    claimed_at: datetime
    model_config = ConfigDict(from_attributes=True)

# --- Claims ---
class RebateClaimResponse(BaseModel):
    claimed_amount: float
    new_balance: float
