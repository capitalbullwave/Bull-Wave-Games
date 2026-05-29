from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List

from app.core.database import get_async_db as get_db
from app.core.deps import get_current_user
from app.models.users import User
from app.schemas.responses import BaseResponse, ErrorResponse
from app.schemas.rebates import RebateDashboardResponse, RebateCategoryResponse, RebateHistoryItem, RebateClaimResponse
from app.services.rebate_service import RebateService
from app.models.rebates import RebateCategory
from sqlalchemy import select

router = APIRouter()

@router.get("/dashboard", response_model=BaseResponse[RebateDashboardResponse])
async def get_dashboard(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    srv = RebateService(db)
    dashboard = await srv.get_dashboard(current_user.id)
    return BaseResponse(data=dashboard, message="Rebate dashboard retrieved successfully")

@router.get("/history", response_model=BaseResponse[List[RebateHistoryItem]])
async def get_history(
    skip: int = 0,
    limit: int = 20,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    srv = RebateService(db)
    history = await srv.get_transaction_history(current_user.id, skip, limit)
    return BaseResponse(data=history, message="Rebate history retrieved successfully")

@router.get("/categories", response_model=BaseResponse[List[RebateCategoryResponse]])
async def get_categories(
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(select(RebateCategory).where(RebateCategory.is_active == True))
    cats = result.scalars().all()
    return BaseResponse(data=[RebateCategoryResponse.model_validate(c) for c in cats], message="Categories retrieved successfully")

@router.post("/claim", response_model=BaseResponse[RebateClaimResponse])
async def claim_rebate(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    srv = RebateService(db)
    claimed_amount = await srv.claim_rebate(current_user.id)
    
    # fetch updated balance
    from app.services.wallet_service import WalletService
    wallet_srv = WalletService(db)
    wallet = await wallet_srv.get_balances(current_user.id)
    
    return BaseResponse(
        data=RebateClaimResponse(claimed_amount=claimed_amount, new_balance=float(wallet.bonus_balance)),
        message="Rebate claimed successfully"
    )
