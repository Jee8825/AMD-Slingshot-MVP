import uuid
from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field

class GrievanceBase(BaseModel):
    title: str = Field(..., max_length=200)
    description: str
    category: str = Field(..., max_length=50)
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    address: Optional[str] = None
    photo_url: Optional[str] = None

class GrievanceCreate(GrievanceBase):
    pass

class GrievanceOut(GrievanceBase):
    id: uuid.UUID
    citizen_id: uuid.UUID
    assigned_to: Optional[uuid.UUID] = None
    status: str
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}
