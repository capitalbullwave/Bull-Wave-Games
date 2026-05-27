from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from typing import Any, List

from app.core.database import get_async_db
from app.core.deps import get_current_user
from app.schemas.others import SupportTicketCreate, SupportTicketResponse, TicketMessageCreate, TicketMessageResponse
from app.models.support import SupportTicket, TicketMessage
from app.models.users import User

router = APIRouter()

@router.post("/tickets", response_model=SupportTicketResponse, status_code=status.HTTP_201_CREATED)
async def create_ticket(
    schema: SupportTicketCreate,
    current_user = Depends(get_current_user),
    db: AsyncSession = Depends(get_async_db)
) -> Any:
    # 1. Create ticket
    ticket = SupportTicket(
        user_id=current_user.id,
        subject=schema.subject,
        status="open",
        priority=schema.priority
    )
    db.add(ticket)
    await db.flush()

    # 2. Add first message
    msg = TicketMessage(
        ticket_id=ticket.id,
        sender_id=current_user.id,
        message=schema.message
    )
    db.add(msg)
    
    await db.commit()
    await db.refresh(ticket, ["messages"])
    
    # Structure return
    messages_out = [{
        "id": msg.id,
        "ticket_id": msg.ticket_id,
        "sender_id": msg.sender_id,
        "sender_username": current_user.username,
        "message": msg.message,
        "attachment_url": msg.attachment_url,
        "created_at": msg.created_at
    }]
    
    return {
        "id": ticket.id,
        "subject": ticket.subject,
        "status": ticket.status,
        "priority": ticket.priority,
        "created_at": ticket.created_at,
        "updated_at": ticket.updated_at,
        "messages": messages_out
    }

@router.get("/tickets", response_model=List[SupportTicketResponse])
async def list_tickets(
    current_user = Depends(get_current_user),
    db: AsyncSession = Depends(get_async_db)
) -> Any:
    query = (
        select(SupportTicket)
        .where(SupportTicket.user_id == current_user.id)
        .order_by(SupportTicket.updated_at.desc())
    )
    result = await db.execute(query)
    return list(result.scalars().all())

@router.get("/tickets/{ticket_id}", response_model=SupportTicketResponse)
async def get_ticket_details(
    ticket_id: int,
    current_user = Depends(get_current_user),
    db: AsyncSession = Depends(get_async_db)
) -> Any:
    query = (
        select(SupportTicket)
        .where(SupportTicket.id == ticket_id, SupportTicket.user_id == current_user.id)
        .options(selectinload(SupportTicket.messages))
    )
    result = await db.execute(query)
    ticket = result.scalars().first()
    if not ticket:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Ticket not found")

    # Enrichment mapping for sender names
    messages_out = []
    for msg in ticket.messages:
        # Fetch sender username
        q_user = select(User.username).where(User.id == msg.sender_id)
        r_user = await db.execute(q_user)
        username = r_user.scalar() or "system"
        messages_out.append({
            "id": msg.id,
            "ticket_id": msg.ticket_id,
            "sender_id": msg.sender_id,
            "sender_username": username,
            "message": msg.message,
            "attachment_url": msg.attachment_url,
            "created_at": msg.created_at
        })

    return {
        "id": ticket.id,
        "subject": ticket.subject,
        "status": ticket.status,
        "priority": ticket.priority,
        "created_at": ticket.created_at,
        "updated_at": ticket.updated_at,
        "messages": messages_out
    }

@router.post("/tickets/{ticket_id}/messages", response_model=TicketMessageResponse)
async def add_ticket_message(
    ticket_id: int,
    schema: TicketMessageCreate,
    current_user = Depends(get_current_user),
    db: AsyncSession = Depends(get_async_db)
) -> Any:
    # 1. Fetch ticket to ensure ownership
    query = select(SupportTicket).where(SupportTicket.id == ticket_id, SupportTicket.user_id == current_user.id)
    result = await db.execute(query)
    ticket = result.scalars().first()
    if not ticket:
         raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Ticket not found")

    if ticket.status == "closed":
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Cannot reply to a closed ticket")

    # 2. Add message
    msg = TicketMessage(
        ticket_id=ticket_id,
        sender_id=current_user.id,
        message=schema.message,
        attachment_url=schema.attachment_url
    )
    db.add(msg)
    
    # 3. Update ticket activity
    ticket.status = "open"  # Re-opens ticket if resolved/in_progress
    ticket.updated_at = datetime.utcnow()
    
    await db.commit()
    await db.refresh(msg)
    
    return {
        "id": msg.id,
        "ticket_id": msg.ticket_id,
        "sender_id": msg.sender_id,
        "sender_username": current_user.username,
        "message": msg.message,
        "attachment_url": msg.attachment_url,
        "created_at": msg.created_at
    }
