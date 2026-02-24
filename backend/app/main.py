"""
DigiGram Pro — FastAPI application entry point.
"""
import os
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from app.config import get_settings

settings = get_settings()


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Startup / shutdown lifecycle."""
    # Auto-create tables for SQLite dev/test (Postgres uses Alembic migrations)
    if settings.DATABASE_URL.startswith("sqlite"):
        from app.database import engine, Base
        from app.models.user import User  # noqa: F401
        from app.models.grievance import Grievance  # noqa: F401
        from app.models.project import Project  # noqa: F401
        from app.models.audit_ledger import AuditLedger  # noqa: F401
        async with engine.begin() as conn:
            await conn.run_sync(
                Base.metadata.create_all,
                tables=[User.__table__, Grievance.__table__, Project.__table__, AuditLedger.__table__],
            )
    yield


app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    lifespan=lifespan,
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.FRONTEND_URL],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Serve uploaded files (ensure dir exists first)
os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=settings.UPLOAD_DIR), name="uploads")


# ── Health check ──────────────────────────────────────────────
@app.get("/api/v1/health", tags=["health"])
async def health_check():
    return {"status": "ok", "app": settings.APP_NAME, "version": settings.APP_VERSION}


# ── Router registration ───────────────────────────────────────
from app.routers import auth as auth_router
from app.routers import grievances as grievances_router
from app.routers import projects as projects_router

app.include_router(auth_router.router, prefix="/api/auth", tags=["Auth"])
app.include_router(grievances_router.router, prefix="/api/v1/grievances", tags=["Grievances"])
app.include_router(projects_router.router, prefix="/api/v1/projects", tags=["Projects"])

# (uncomment as implemented)
# from app.routers import users, uploads
from app.routers import ai_verification
from app.routers import ledger
# app.include_router(users.router,        prefix="/api/v1/users",        tags=["Users"])
app.include_router(ledger.router,       prefix="/api/v1/ledger",       tags=["Ledger"])
app.include_router(ai_verification.router, prefix="/api/v1/verify-image", tags=["AI Verification"])
# app.include_router(uploads.router,      prefix="/api/v1/uploads",      tags=["Uploads"])
