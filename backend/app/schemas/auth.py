"""
Pydantic schemas for authentication endpoints.
"""
import uuid
from datetime import datetime
from pydantic import BaseModel, EmailStr, Field
from typing import Optional


# ── Request Schemas ───────────────────────────────────────────

class RegisterRequest(BaseModel):
    full_name: str = Field(..., min_length=2, max_length=120, examples=["Raju Kumar"])
    phone: str = Field(..., min_length=10, max_length=15, examples=["+919876543210"])
    email: Optional[str] = Field(None, max_length=255, examples=["raju@example.com"])
    password: str = Field(..., min_length=6, max_length=128, examples=["strong_pass123"])
    role: str = Field(
        default="CITIZEN",
        pattern=r"^(CITIZEN|OFFICIAL)$",
        examples=["CITIZEN"],
        description="User role — CITIZEN or OFFICIAL",
    )
    village: Optional[str] = Field(None, max_length=100, examples=["Koraput"])
    district: Optional[str] = Field(None, max_length=100, examples=["Koraput"])


class LoginRequest(BaseModel):
    phone: str = Field(..., min_length=10, max_length=15, examples=["+919876543210"])
    password: str = Field(..., min_length=1, max_length=128, examples=["strong_pass123"])


# ── Response Schemas ──────────────────────────────────────────

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"


class UserOut(BaseModel):
    id: uuid.UUID
    full_name: str
    phone: str
    email: Optional[str] = None
    role: str
    village: Optional[str] = None
    district: Optional[str] = None
    is_active: bool
    created_at: datetime

    model_config = {"from_attributes": True}


class RegisterResponse(BaseModel):
    user: UserOut
    access_token: str
    token_type: str = "bearer"
