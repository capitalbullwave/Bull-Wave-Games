from pydantic import BaseModel, EmailStr, Field, field_validator
from typing import Optional
import re

class UserRegister(BaseModel):
    username: str = Field(..., min_length=3, max_length=50)
    mobile: str = Field(..., min_length=10, max_length=15)
    email: Optional[EmailStr] = None
    password: str = Field(..., min_length=6, max_length=100)
    referral_code: Optional[str] = None  # Optional referrer's code

    @field_validator("mobile")
    @classmethod
    def validate_mobile(cls, v: str) -> str:
        if not re.match(r"^\+?[1-9]\d{1,14}$", v):
            raise ValueError("Invalid mobile number format")
        return v

class UserLogin(BaseModel):
    username_or_mobile: str
    password: str
    ip_address: Optional[str] = None
    user_agent: Optional[str] = None

class Token(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"

class TokenPayload(BaseModel):
    sub: Optional[str] = None
    type: Optional[str] = None
    exp: Optional[int] = None

class RefreshTokenRequest(BaseModel):
    refresh_token: str

class ForgotPasswordRequest(BaseModel):
    mobile_or_email: str

class ResetPasswordRequest(BaseModel):
    mobile_or_email: str
    otp_code: str
    new_password: str = Field(..., min_length=6)

class OTPVerifyRequest(BaseModel):
    mobile_or_email: str
    otp_code: str
    purpose: str  # register, login, reset_password, wallet_withdraw

class OTPResendRequest(BaseModel):
    mobile_or_email: str
    purpose: str
