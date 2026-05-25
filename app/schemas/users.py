from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List
from datetime import datetime

class ProfileUpdate(BaseModel):
    full_name: Optional[str] = Field(None, max_length=100)
    date_of_birth: Optional[datetime] = None
    gender: Optional[str] = Field(None, max_length=10)
    address: Optional[str] = None

class ProfileResponse(BaseModel):
    full_name: Optional[str] = None
    date_of_birth: Optional[datetime] = None
    gender: Optional[str] = None
    address: Optional[str] = None
    profile_image: Optional[str] = None

    class Config:
        from_attributes = True

class KYCUpdate(BaseModel):
    pan_number: str = Field(..., min_length=10, max_length=10)
    aadhaar_reference: str = Field(..., min_length=12, max_length=12)

class KYCResponse(BaseModel):
    pan_number: Optional[str] = None
    aadhaar_reference: Optional[str] = None
    status: str
    rejection_reason: Optional[str] = None

    class Config:
        from_attributes = True

class BankAccountCreate(BaseModel):
    bank_name: str = Field(..., min_length=2, max_length=100)
    account_number: str = Field(..., min_length=8, max_length=50)
    ifsc_code: str = Field(..., min_length=11, max_length=11)
    upi_id: Optional[str] = Field(None, max_length=100)

class BankAccountResponse(BaseModel):
    id: int
    bank_name: str
    account_number: str
    ifsc_code: str
    upi_id: Optional[str] = None
    is_active: bool

    class Config:
        from_attributes = True

class UserResponse(BaseModel):
    id: int
    username: str
    mobile: str
    email: Optional[EmailStr] = None
    role: str
    vip_level_id: Optional[int] = None
    referral_code: str
    created_at: datetime
    
    profile: Optional[ProfileResponse] = None
    kyc: Optional[KYCResponse] = None

    class Config:
        from_attributes = True
