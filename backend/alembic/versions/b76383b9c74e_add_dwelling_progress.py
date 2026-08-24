"""Add dwelling progress.

Revision ID: b76383b9c74e
Revises: 00623007a53d
Create Date: 2026-08-24 19:48:58.366594
"""

import sqlalchemy as sa
from alembic import op
from sqlalchemy.dialects import postgresql

revision = "b76383b9c74e"
down_revision = "00623007a53d"
branch_labels = None
depends_on = None


DWELLING_PROGRESS_STAGE_ENUM = postgresql.ENUM(
    "structure",
    "electricity",
    "plumbing",
    "air_conditioning",
    "sanitation",
    "home_automation",
    "bracing",
    "interior_board",
    "insulation",
    "exterior_board",
    "facade",
    "roof",
    "carpentry",
    name="dwelling_progress_stage",
    create_type=False,
)


def upgrade() -> None:
    """Create the dwelling progress table."""
    DWELLING_PROGRESS_STAGE_ENUM.create(
        op.get_bind(),
        checkfirst=True,
    )

    op.create_table(
        "dwelling_progress",
        sa.Column(
            "id",
            sa.UUID(),
            nullable=False,
        ),
        sa.Column(
            "dwelling_id",
            sa.UUID(),
            nullable=False,
        ),
        sa.Column(
            "stage",
            DWELLING_PROGRESS_STAGE_ENUM,
            nullable=False,
        ),
        sa.Column(
            "percentage",
            sa.SmallInteger(),
            server_default="0",
            nullable=False,
        ),
        sa.Column(
            "updated_by_id",
            sa.UUID(),
            nullable=False,
        ),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.Column(
            "updated_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.CheckConstraint(
            "percentage >= 0 AND percentage <= 100",
            name="ck_dwelling_progress_percentage",
        ),
        sa.ForeignKeyConstraint(
            ["dwelling_id"],
            ["dwellings.id"],
            ondelete="CASCADE",
        ),
        sa.ForeignKeyConstraint(
            ["updated_by_id"],
            ["users.id"],
            ondelete="RESTRICT",
        ),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint(
            "dwelling_id",
            "stage",
            name="uq_dwelling_progress_dwelling_stage",
        ),
    )

    op.create_index(
        op.f("ix_dwelling_progress_dwelling_id"),
        "dwelling_progress",
        ["dwelling_id"],
        unique=False,
    )


def downgrade() -> None:
    """Remove the dwelling progress table."""
    op.drop_index(
        op.f("ix_dwelling_progress_dwelling_id"),
        table_name="dwelling_progress",
    )

    op.drop_table("dwelling_progress")

    DWELLING_PROGRESS_STAGE_ENUM.drop(
        op.get_bind(),
        checkfirst=True,
    )
