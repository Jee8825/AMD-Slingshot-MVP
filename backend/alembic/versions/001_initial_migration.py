"""Initial migration — all 5 tables

Revision ID: 001
Revises: 
Create Date: 2026-02-20

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = "001"
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # ── Users ──────────────────────────────────────────────
    op.create_table(
        "users",
        sa.Column("id", sa.Uuid(), primary_key=True),
        sa.Column("full_name", sa.String(120), nullable=False),
        sa.Column("phone", sa.String(15), unique=True, nullable=False),
        sa.Column("email", sa.String(255), unique=True, nullable=True),
        sa.Column("password_hash", sa.Text(), nullable=False),
        sa.Column("role", sa.String(10), nullable=False, server_default="CITIZEN"),
        sa.Column("village", sa.String(100), nullable=True),
        sa.Column("district", sa.String(100), nullable=True),
        sa.Column("is_active", sa.Boolean(), server_default=sa.text("true")),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
    )

    # ── Grievances ─────────────────────────────────────────
    op.create_table(
        "grievances",
        sa.Column("id", sa.Uuid(), primary_key=True),
        sa.Column("citizen_id", sa.Uuid(), sa.ForeignKey("users.id"), nullable=False),
        sa.Column("assigned_to", sa.Uuid(), sa.ForeignKey("users.id"), nullable=True),
        sa.Column("title", sa.String(200), nullable=False),
        sa.Column("description", sa.Text(), nullable=False),
        sa.Column("category", sa.String(50), nullable=False),
        sa.Column("status", sa.String(20), nullable=False, server_default="SUBMITTED"),
        sa.Column("latitude", sa.Float(), nullable=True),
        sa.Column("longitude", sa.Float(), nullable=True),
        sa.Column("address", sa.Text(), nullable=True),
        sa.Column("photo_url", sa.Text(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
    )

    # ── Grievance Timeline ─────────────────────────────────
    op.create_table(
        "grievance_timeline",
        sa.Column("id", sa.Uuid(), primary_key=True),
        sa.Column("grievance_id", sa.Uuid(), sa.ForeignKey("grievances.id"), nullable=False),
        sa.Column("changed_by", sa.Uuid(), sa.ForeignKey("users.id"), nullable=False),
        sa.Column("old_status", sa.String(20), nullable=True),
        sa.Column("new_status", sa.String(20), nullable=False),
        sa.Column("note", sa.Text(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
    )

    # ── Audit Ledger ───────────────────────────────────────
    op.create_table(
        "audit_ledger",
        sa.Column("id", sa.BigInteger(), primary_key=True, autoincrement=True),
        sa.Column("scheme_name", sa.String(200), nullable=False),
        sa.Column("amount", sa.Numeric(14, 2), nullable=False),
        sa.Column("beneficiary", sa.String(200), nullable=True),
        sa.Column("disbursed_by", sa.Uuid(), sa.ForeignKey("users.id"), nullable=False),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column("prev_hash", sa.String(64), nullable=False),
        sa.Column("current_hash", sa.String(64), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
    )

    # ── AI Verifications ───────────────────────────────────
    op.create_table(
        "ai_verifications",
        sa.Column("id", sa.Uuid(), primary_key=True),
        sa.Column("grievance_id", sa.Uuid(), sa.ForeignKey("grievances.id"), nullable=False),
        sa.Column("uploaded_by", sa.Uuid(), sa.ForeignKey("users.id"), nullable=False),
        sa.Column("image_url", sa.Text(), nullable=False),
        sa.Column("ai_verdict", sa.Text(), nullable=True),
        sa.Column("confidence", sa.Float(), nullable=True),
        sa.Column("raw_response", postgresql.JSONB(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
    )

    # ── Indexes ────────────────────────────────────────────
    op.create_index("idx_grievances_citizen", "grievances", ["citizen_id"])
    op.create_index("idx_grievances_status", "grievances", ["status"])
    op.create_index("idx_grievances_geo", "grievances", ["latitude", "longitude"])
    op.create_index("idx_audit_ledger_scheme", "audit_ledger", ["scheme_name"])
    op.create_index("idx_timeline_grievance", "grievance_timeline", ["grievance_id"])


def downgrade() -> None:
    op.drop_index("idx_timeline_grievance")
    op.drop_index("idx_audit_ledger_scheme")
    op.drop_index("idx_grievances_geo")
    op.drop_index("idx_grievances_status")
    op.drop_index("idx_grievances_citizen")
    op.drop_table("ai_verifications")
    op.drop_table("audit_ledger")
    op.drop_table("grievance_timeline")
    op.drop_table("grievances")
    op.drop_table("users")
