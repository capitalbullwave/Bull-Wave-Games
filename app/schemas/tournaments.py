from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class TournamentResponse(BaseModel):
    id: int
    title: str
    description: Optional[str] = None
    entry_fee: float
    prize_pool: float
    starts_at: datetime
    ends_at: datetime
    max_participants: Optional[int] = None
    current_participants: int
    status: str

    class Config:
        from_attributes = True

class TournamentJoinResponse(BaseModel):
    message: str
    joined_at: datetime
    tournament_id: int

class LeaderboardEntryResponse(BaseModel):
    rank: int
    username: str
    score: float
    date_reference: str

class WinnerFeedResponse(BaseModel):
    username: str
    game_name: str
    payout_amount: float
    created_at: datetime
