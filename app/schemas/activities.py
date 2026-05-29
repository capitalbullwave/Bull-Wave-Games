from pydantic import BaseModel, ConfigDict
from typing import List, Optional
from datetime import datetime
from app.models.activities import ActivityType

# ----------------- Tasks -----------------

class ActivityTaskBase(BaseModel):
    title: str
    description: Optional[str] = None
    target_amount: float
    reward_amount: float
    activity_type: ActivityType
    is_active: bool = True

class ActivityTaskCreate(ActivityTaskBase):
    pass

class ActivityTaskUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    target_amount: Optional[float] = None
    reward_amount: Optional[float] = None
    activity_type: Optional[ActivityType] = None
    is_active: Optional[bool] = None

class ActivityTaskResponse(ActivityTaskBase):
    id: int
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)

# ----------------- User Progress -----------------

class ActivityProgressResponse(BaseModel):
    id: int
    title: str
    targetAmount: float
    currentAmount: float
    rewardAmount: float
    completed: bool
    claimed: bool
    activity_type: ActivityType
    is_active: bool

    model_config = ConfigDict(from_attributes=True)

class UserActivityProgressDB(BaseModel):
    id: int
    user_id: int
    task_id: int
    current_amount: float
    completed: bool
    claimed: bool
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)

# ----------------- Composite Responses -----------------

class ActivityListResponse(BaseModel):
    todayBonus: float
    totalBonus: float
    activities: List[ActivityProgressResponse]

class ActivityRewardHistoryResponse(BaseModel):
    id: int
    task_id: int
    title: str
    reward_amount: float
    claimed_at: datetime

    model_config = ConfigDict(from_attributes=True)
