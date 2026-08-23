"""add projects and dwellings

Revision ID: 5e2a3b931b9b
Revises: 4be7bae7f7c9
Create Date: 2026-08-23 15:28:59.125153
"""

import sqlalchemy as sa
from alembic import op
from sqlalchemy.dialects import postgresql

revision = "5e2a3b931b9b"
down_revision = "4be7bae7f7c9"
branch_labels = None
depends_on = None


PROJECT_STATUS_ENUM = postgresql.ENUM(
    "planning",
    "active",
    "paused",
    "completed",
    name="project_status",
    create_type=False,
)


def upgrade() -> None:
    """Create projects and dwellings."""
    PROJECT_STATUS_ENUM.create(
        op.get_bind(),
        checkfirst=True,
    )

    op.create_table(
        "projects",
        sa.Column(
            "id",
            sa.UUID(),
            nullable=False,
        ),
        sa.Column(
            "code",
            sa.String(length=100),
            nullable=False,
        ),
        sa.Column(
            "name",
            sa.String(length=160),
            nullable=False,
        ),
        sa.Column(
            "description",
            sa.Text(),
            nullable=True,
        ),
        sa.Column(
            "address",
            sa.String(length=255),
            nullable=False,
        ),
        sa.Column(
            "postal_code",
            sa.String(length=20),
            nullable=False,
        ),
        sa.Column(
            "city",
            sa.String(length=120),
            nullable=False,
        ),
        sa.Column(
            "province",
            sa.String(length=120),
            nullable=False,
        ),
        sa.Column(
            "latitude",
            sa.Float(),
            nullable=True,
        ),
        sa.Column(
            "longitude",
            sa.Float(),
            nullable=True,
        ),
        sa.Column(
            "status",
            PROJECT_STATUS_ENUM,
            server_default="planning",
            nullable=False,
        ),
        sa.Column(
            "created_by_id",
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
        sa.ForeignKeyConstraint(
            ["created_by_id"],
            ["users.id"],
            ondelete="RESTRICT",
        ),
        sa.PrimaryKeyConstraint("id"),
    )

    op.create_index(
        op.f("ix_projects_code"),
        "projects",
        ["code"],
        unique=True,
    )

    op.create_table(
        "dwellings",
        sa.Column(
            "id",
            sa.UUID(),
            nullable=False,
        ),
        sa.Column(
            "project_id",
            sa.UUID(),
            nullable=False,
        ),
        sa.Column(
            "code",
            sa.String(length=120),
            nullable=False,
        ),
        sa.Column(
            "number",
            sa.String(length=60),
            nullable=False,
        ),
        sa.Column(
            "description",
            sa.Text(),
            nullable=True,
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
        sa.ForeignKeyConstraint(
            ["project_id"],
            ["projects.id"],
            ondelete="CASCADE",
        ),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint(
            "project_id",
            "number",
            name="uq_dwellings_project_number",
        ),
    )

    op.create_index(
        op.f("ix_dwellings_code"),
        "dwellings",
        ["code"],
        unique=True,
    )
    op.create_index(
        op.f("ix_dwellings_project_id"),
        "dwellings",
        ["project_id"],
        unique=False,
    )


def downgrade() -> None:
    """Remove projects and dwellings."""
    op.drop_index(
        op.f("ix_dwellings_project_id"),
        table_name="dwellings",
    )
    op.drop_index(
        op.f("ix_dwellings_code"),
        table_name="dwellings",
    )
    op.drop_table("dwellings")

    op.drop_index(
        op.f("ix_projects_code"),
        table_name="projects",
    )
    op.drop_table("projects")

    PROJECT_STATUS_ENUM.drop(
        op.get_bind(),
        checkfirst=True,
    )