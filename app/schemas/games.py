from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime

class GameCategoryResponse(BaseModel):
    id: int
    name: str
    slug: str

    class Config:
        from_attributes = True

class GameResponse(BaseModel):
    id: int
    category_id: int
    name: str
    provider: str
    thumbnail_url: Optional[str] = None
    is_active: bool

    class Config:
        from_attributes = True

class GameSessionLaunchResponse(BaseModel):
    session_token: str
    launch_url: str

class BetCreate(BaseModel):
    game_id: int
    bet_amount: float = Field(..., gt=0)
    wallet_type: str = Field("main", description="main, bonus, winning")
    prediction: Optional[str] = None  # e.g., "red", "green", "number_7"

class BetResponse(BaseModel):
    id: int
    game_id: int
    bet_amount: float
    wallet_type: str
    prediction: Optional[str] = None
    status: str
    payout_amount: float
    created_at: datetime
    settled_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class ResultResponse(BaseModel):
    id: int
    game_id: int
    period_no: Optional[str] = None
    result_data: str
    created_at: datetime

    class Config:
        from_attributes = True
