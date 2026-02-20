import uuid
from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field, model_validator

class ProjectBase(BaseModel):
    name: str = Field(..., max_length=200, description="Name of the project or scheme")
    description: Optional[str] = None
    allocated_budget: float = Field(..., gt=0, description="Must be a positive float")
    disbursed_amount: float = Field(default=0, ge=0, description="Cannot be negative")
    status: str = Field(default="Pending", description="Status of the project")
    image_url: Optional[str] = None

    @model_validator(mode="after")
    def check_disbursed(self) -> "ProjectBase":
        if self.disbursed_amount > self.allocated_budget:
            raise ValueError("disbursed_amount cannot exceed allocated_budget")
        return self

class ProjectCreate(ProjectBase):
    pass

class ProjectUpdate(BaseModel):
    name: Optional[str] = Field(None, max_length=200)
    description: Optional[str] = None
    allocated_budget: Optional[float] = Field(None, gt=0)
    disbursed_amount: Optional[float] = Field(None, ge=0)
    status: Optional[str] = None
    image_url: Optional[str] = None

    @model_validator(mode="after")
    def check_disbursed(self) -> "ProjectUpdate":
        if self.allocated_budget is not None and self.disbursed_amount is not None:
            if self.disbursed_amount > self.allocated_budget:
                raise ValueError("disbursed_amount cannot exceed allocated_budget")
        return self

class ProjectOut(ProjectBase):
    id: uuid.UUID
    created_by: uuid.UUID
    created_at: datetime
    updated_at: datetime
    
    model_config = {"from_attributes": True}
