from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List

from app.database import get_db
from app.models.audit_ledger import AuditLedger
from app.schemas.ledger import LedgerEntryOut

router = APIRouter()

@router.get("/", response_model=List[LedgerEntryOut], summary="Get full audit ledger trail")
async def get_ledger(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(AuditLedger).order_by(AuditLedger.id.asc()))
    ledger_entries = result.scalars().all()
    return ledger_entries
