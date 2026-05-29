from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List

from app.core.database import get_async_db
from app.core.deps import get_current_user
from app.models.users import User
from app.schemas.responses import BaseResponse, success_response, error_response
from app.schemas.activities import ActivityTaskCreate, ActivityTaskUpdate, ActivityTaskResponse
from app.services.activity_service import ActivityService

router = APIRouter()

def get_admin_user(current_user: User = Depends(get_current_user)):
    if current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You don't have enough permissions"
        )
    return current_user

@router.post("/create", response_model=BaseResponse[ActivityTaskResponse])
async def create_activity_task(
    task_in: ActivityTaskCreate,
    current_user: User = Depends(get_admin_user),
    db: AsyncSession = Depends(get_async_db)
):
    """Admin: Create an activity task."""
    srv = ActivityService(db)
    task = await srv.create_task(task_in)
    return success_response(data=task, message="Task created successfully")

@router.get("/list", response_model=BaseResponse[List[ActivityTaskResponse]])
async def list_activity_tasks(
    current_user: User = Depends(get_admin_user),
    db: AsyncSession = Depends(get_async_db)
):
    """Admin: List all activity tasks."""
    srv = ActivityService(db)
    tasks = await srv.get_all_tasks()
    return success_response(data=tasks)

@router.put("/{task_id}", response_model=BaseResponse[ActivityTaskResponse])
async def update_activity_task(
    task_id: int,
    task_in: ActivityTaskUpdate,
    current_user: User = Depends(get_admin_user),
    db: AsyncSession = Depends(get_async_db)
):
    """Admin: Update an activity task."""
    srv = ActivityService(db)
    task = await srv.update_task(task_id, task_in)
    return success_response(data=task, message="Task updated successfully")

@router.delete("/{task_id}", response_model=BaseResponse[None])
async def delete_activity_task(
    task_id: int,
    current_user: User = Depends(get_admin_user),
    db: AsyncSession = Depends(get_async_db)
):
    """Admin: Delete an activity task."""
    srv = ActivityService(db)
    await srv.delete_task(task_id)
    return success_response(message="Task deleted successfully")

@router.patch("/status/{task_id}", response_model=BaseResponse[ActivityTaskResponse])
async def change_activity_status(
    task_id: int,
    is_active: bool,
    current_user: User = Depends(get_admin_user),
    db: AsyncSession = Depends(get_async_db)
):
    """Admin: Enable or disable an activity task."""
    srv = ActivityService(db)
    task_update = ActivityTaskUpdate(is_active=is_active)
    task = await srv.update_task(task_id, task_update)
    return success_response(data=task, message=f"Task {'enabled' if is_active else 'disabled'} successfully")
