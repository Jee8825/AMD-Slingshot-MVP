from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models.user import User
from app.models.grievance import Grievance
from app.schemas.grievance import GrievanceCreate, GrievanceOut
from app.routers.auth import get_current_user

router = APIRouter()

@router.post(
    "/",
    response_model=GrievanceOut,
    status_code=status.HTTP_201_CREATED,
    summary="Create a new grievance",
)
async def create_grievance(
    body: GrievanceCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    # The POST endpoint must extract the citizen_id directly from the JWT dependency.
    new_grievance = Grievance(
        citizen_id=current_user.id,
        title=body.title,
        description=body.description,
        category=body.category,
        latitude=body.latitude,
        longitude=body.longitude,
        address=body.address,
        photo_url=body.photo_url,
    )
    db.add(new_grievance)
    await db.flush()
    await db.refresh(new_grievance)
    
    return new_grievance

@router.get(
    "/",
    response_model=List[GrievanceOut],
    summary="List grievances",
)
async def list_grievances(
    status: Optional[str] = None,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    # Optionally, restrict if citizen: only see their own.
    # If OFFICIAL, see all? For now we will return according to role or just simply what's there
    query = select(Grievance)
    
    if current_user.role == "CITIZEN":
        query = query.where(Grievance.citizen_id == current_user.id)
        
    if status:
        query = query.where(Grievance.status == status)
        
    result = await db.execute(query)
        
    grievances = result.scalars().all()
    return grievances
