import uuid
from datetime import datetime
from pydantic import BaseModel
from typing import Optional

class LedgerEntryOut(BaseModel):
    id: int
    scheme_name: str
    amount: float
    beneficiary: Optional[str] = None
    disbursed_by: uuid.UUID
    description: Optional[str] = None
    prev_hash: str
    current_hash: str
    created_at: datetime

    class Config:
        from_attributes = True
