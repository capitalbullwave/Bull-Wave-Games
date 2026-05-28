from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import Any, List

from app.core.database import get_async_db
from app.core.deps import get_current_user
from app.schemas.users import UserResponse, ProfileUpdate, ProfileResponse, KYCUpdate, KYCResponse, BankAccountCreate, BankAccountResponse
from app.models.users import Profile, KYCRecord, BankAccount
from app.core.security import get_password_hash
from pydantic import BaseModel, Field

router = APIRouter()

@router.get("/", response_model=List[UserResponse])
async def get_all_users(
    db: AsyncSession = Depends(get_async_db)
) -> Any:
    """
    Retrieve all registered users.
    """
    from sqlalchemy.orm import selectinload
    from app.models.users import User
    
    query = select(User).options(
        selectinload(User.profile),
        selectinload(User.kyc),
        selectinload(User.wallet)
    )
    result = await db.execute(query)
    return list(result.scalars().all())

@router.delete("/{email}")
async def delete_user(
    email: str,
    db: AsyncSession = Depends(get_async_db)
) -> Any:
    """
    Delete a specific user by Email.
    """
    from app.models.users import User
    
    query = select(User).where(User.email == email)
    result = await db.execute(query)
    user = result.scalars().first()
    
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
        
    await db.delete(user)
    await db.commit()
    
    return {"detail": f"User with email {email} deleted successfully"}

class SetPasswordRequest(BaseModel):
    password: str = Field(..., min_length=4, max_length=100)

@router.post("/set-password")
async def set_password(
    schema: SetPasswordRequest,
    current_user = Depends(get_current_user),
    db: AsyncSession = Depends(get_async_db)
) -> Any:
    current_user.password_hash = get_password_hash(schema.password)
    await db.commit()
    return {"detail": "Password successfully updated"}

@router.get("/me", response_model=UserResponse)
async def get_current_user_profile(
    current_user = Depends(get_current_user),
    db: AsyncSession = Depends(get_async_db)
) -> Any:
    # Trigger active lazy relationships mapping check
    await db.refresh(current_user, ["profile", "kyc", "wallet"])
    return current_user

@router.put("/profile", response_model=ProfileResponse)
async def update_profile(
    schema: ProfileUpdate,
    current_user = Depends(get_current_user),
    db: AsyncSession = Depends(get_async_db)
) -> Any:
    query = select(Profile).where(Profile.user_id == current_user.id)
    result = await db.execute(query)
    profile = result.scalars().first()
    
    if not profile:
        profile = Profile(user_id=current_user.id)
        db.add(profile)
        
    for field, value in schema.model_dump(exclude_unset=True).items():
        setattr(profile, field, value)
        
    await db.commit()
    await db.refresh(profile)
    return profile

@router.post("/kyc", response_model=KYCResponse)
async def submit_kyc(
    schema: KYCUpdate,
    current_user = Depends(get_current_user),
    db: AsyncSession = Depends(get_async_db)
) -> Any:
    query = select(KYCRecord).where(KYCRecord.user_id == current_user.id)
    result = await db.execute(query)
    kyc = result.scalars().first()
    
    if not kyc:
        kyc = KYCRecord(user_id=current_user.id)
        db.add(kyc)
        
    kyc.pan_number = schema.pan_number
    kyc.aadhaar_reference = schema.aadhaar_reference
    kyc.status = "pending"
    kyc.rejection_reason = None
    
    await db.commit()
    await db.refresh(kyc)
    return kyc

@router.get("/bank-accounts", response_model=List[BankAccountResponse])
async def list_bank_accounts(
    current_user = Depends(get_current_user),
    db: AsyncSession = Depends(get_async_db)
) -> Any:
    query = select(BankAccount).where(BankAccount.user_id == current_user.id, BankAccount.is_active == True)
    result = await db.execute(query)
    return list(result.scalars().all())

@router.post("/bank-accounts", response_model=BankAccountResponse)
async def add_bank_account(
    schema: BankAccountCreate,
    current_user = Depends(get_current_user),
    db: AsyncSession = Depends(get_async_db)
) -> Any:
    bank_account = BankAccount(
        user_id=current_user.id,
        bank_name=schema.bank_name,
        account_number=schema.account_number,
        ifsc_code=schema.ifsc_code,
        upi_id=schema.upi_id,
        is_active=True
    )
    db.add(bank_account)
    await db.commit()
    await db.refresh(bank_account)
    return bank_account
