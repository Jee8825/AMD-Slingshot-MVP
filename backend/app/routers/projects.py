import uuid
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status, File, UploadFile, Form
from typing import Optional
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models.user import User
from app.models.project import Project
from app.schemas.project import ProjectCreate, ProjectUpdate, ProjectOut
from app.routers.auth import get_current_user
from app.routers.ai_verification import mock_ai_verify_image
from app.models.audit_ledger import AuditLedger
from app.utils.hashing import generate_ledger_hash

router = APIRouter()

def require_official_role(current_user: User = Depends(get_current_user)) -> User:
    if current_user.role != "OFFICIAL":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only officials can modify projects",
        )
    return current_user

@router.get(
    "/",
    response_model=List[ProjectOut],
    summary="List all projects",
)
async def list_projects(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    result = await db.execute(select(Project))
    projects = result.scalars().all()
    return projects

@router.post(
    "/",
    response_model=ProjectOut,
    status_code=status.HTTP_201_CREATED,
    summary="Create a new project",
)
async def create_project(
    body: ProjectCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_official_role),
):
    new_project = Project(
        name=body.name,
        description=body.description,
        allocated_budget=body.allocated_budget,
        disbursed_amount=body.disbursed_amount,
        created_by=current_user.id,
    )
    db.add(new_project)
    await db.flush()
    await db.refresh(new_project)
    return new_project

@router.put(
    "/{project_id}",
    response_model=ProjectOut,
    summary="Update a project",
)
async def update_project(
    project_id: uuid.UUID,
    name: Optional[str] = Form(None),
    description: Optional[str] = Form(None),
    allocated_budget: Optional[float] = Form(None),
    disbursed_amount: Optional[float] = Form(None),
    status: Optional[str] = Form(None),
    image_url: Optional[str] = Form(None),
    file: Optional[UploadFile] = File(None),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_official_role),
):
    result = await db.execute(select(Project).where(Project.id == project_id))
    project = result.scalar_one_or_none()
    
    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found",
        )
    
    # Check completion conditions
    if status == "Completed":
        if not image_url and not file:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="image_url or file payload is required to mark project as Completed"
            )
        
        # Integrate with AI verification
        if file:
            ai_result = await mock_ai_verify_image(file)
            if ai_result["status"] != "VERIFIED":
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="AI Verification failed for the provided image file"
                )
            project.image_url = f"uploads/{file.filename}"
        elif image_url:
            # simple mock for URL
            project.image_url = image_url
            
        project.status = "Completed"
    
    # Make updates
    if name is not None:
        project.name = name
    if description is not None:
        project.description = description
    if allocated_budget is not None:
        project.allocated_budget = allocated_budget
    if disbursed_amount is not None:
        if disbursed_amount > project.disbursed_amount:
            disbursed_diff = disbursed_amount - project.disbursed_amount
            
            # Create a new ledger entry
            last_ledger_result = await db.execute(select(AuditLedger).order_by(AuditLedger.id.desc()).limit(1))
            last_ledger = last_ledger_result.scalar_one_or_none()
            prev_hash = last_ledger.current_hash if last_ledger else "0" * 64
            
            p_name = name if name is not None else project.name
            p_desc = description if description is not None else project.description
            
            transaction_data = {
                "scheme_name": p_name,
                "amount": float(disbursed_diff),
                "beneficiary": "",
                "disbursed_by": str(current_user.id),
                "description": p_desc if p_desc else f"Disbursement for project {project_id}",
            }
            current_hash = generate_ledger_hash(transaction_data, prev_hash)
            
            new_ledger = AuditLedger(
                scheme_name=p_name,
                amount=float(disbursed_diff),
                beneficiary=None,
                disbursed_by=current_user.id,
                description=p_desc if p_desc else f"Disbursement for project {project_id}",
                prev_hash=prev_hash,
                current_hash=current_hash
            )
            db.add(new_ledger)
        project.disbursed_amount = disbursed_amount
    if status is not None and status != "Completed":
        project.status = status
    elif status == "Completed":
        pass # already handled above
        
    if project.disbursed_amount > project.allocated_budget:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="disbursed_amount cannot exceed allocated_budget",
        )
        
    await db.flush()
    await db.refresh(project)
    return project
