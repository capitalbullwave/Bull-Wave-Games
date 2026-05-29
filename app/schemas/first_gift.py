from pydantic import BaseModel

class FirstGiftStatusResponse(BaseModel):
    has_deposit: bool
    first_deposit_amount: float
    potential_bonus: float
    is_eligible: bool
    is_claimed: bool
    message: str

class FirstGiftClaimResponse(BaseModel):
    claimed_amount: float
    message: str
