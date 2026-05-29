from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List

from app.core.database import get_async_db as get_db
from app.core.deps import get_current_user
from app.models.users import User
from app.schemas.responses import BaseResponse, ErrorResponse

# Since there is no get_current_admin in deps by default, we use get_current_user in the router dependencies if not defined, or define it locally.
def get_current_admin(current_user: User = Depends(get_current_user)):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Not enough privileges")
    return current_user
from app.schemas.rebates import RebateCategoryCreate, RebateCategoryUpdate, RebateCategoryResponse, VIPRebateRateCreate, VIPRebateRateResponse
from app.models.rebates import RebateCategory, VIPRebateRate
from sqlalchemy import select, update

router = APIRouter()

@router.post("/category", response_model=BaseResponse[RebateCategoryResponse])
async def create_category(
    payload: RebateCategoryCreate,
    current_admin: User = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db)
):
    cat = RebateCategory(**payload.model_dump())
    db.add(cat)
    await db.commit()
    await db.refresh(cat)
    return BaseResponse(data=RebateCategoryResponse.model_validate(cat), message="Category created")

@router.put("/category/{category_id}", response_model=BaseResponse[RebateCategoryResponse])
async def update_category(
    category_id: int,
    payload: RebateCategoryUpdate,
    current_admin: User = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db)
):
    cat = await db.get(RebateCategory, category_id)
    if not cat:
        raise HTTPException(status_code=404, detail="Category not found")
        
    for key, val in payload.model_dump(exclude_unset=True).items():
        setattr(cat, key, val)
        
    await db.commit()
    await db.refresh(cat)
    return BaseResponse(data=RebateCategoryResponse.model_validate(cat), message="Category updated")

@router.post("/vip-rate", response_model=BaseResponse[VIPRebateRateResponse])
async def create_vip_rate(
    payload: VIPRebateRateCreate,
    current_admin: User = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db)
):
    # Check existing
    stmt = select(VIPRebateRate).where(
        VIPRebateRate.vip_level_id == payload.vip_level_id,
        VIPRebateRate.category_id == payload.category_id
    )
    result = await db.execute(stmt)
    existing = result.scalars().first()
    
    if existing:
        existing.rebate_percentage = payload.rebate_percentage
        rate = existing
    else:
        rate = VIPRebateRate(**payload.model_dump())
        db.add(rate)
        
    await db.commit()
    await db.refresh(rate)
    return BaseResponse(data=VIPRebateRateResponse.model_validate(rate), message="VIP Rate configured")
