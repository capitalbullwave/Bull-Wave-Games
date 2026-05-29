from pydantic import BaseModel
from datetime import datetime
from typing import List, Optional

class SuperJackpotResponse(BaseModel):
    id: int
    amount: float
    expires_at: datetime
    is_claimed: bool
    created_at: datetime
    claimed_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class SuperJackpotStatusResponse(BaseModel):
    unclaimed_count: int
    total_unclaimed_amount: float
    jackpots: List[SuperJackpotResponse]

class SuperJackpotClaimResponse(BaseModel):
    claimed_count: int
    total_claimed_amount: float
