"""add persistent user sessions

Revision ID: 4be7bae7f7c9
Revises: 1c5b34022fb7
Create Date: 2026-08-23 00:40:25.299876
"""

from alembic import op
import sqlalchemy as sa


revision = "4be7bae7f7c9"
down_revision = "1c5b34022fb7"
branch_labels = None
depends_on = None


def upgrade() -> None:
    """Create the persistent user sessions table."""
    op.create_table(
        "user_sessions",
        sa.Column(
            "id",
            sa.UUID(),
            nullable=False,
        ),
        sa.Column(
            "user_id",
            sa.UUID(),
            nullable=False,
        ),
        sa.Column(
            "refresh_token_hash",
            sa.String(length=64),
            nullable=False,
        ),
        sa.Column(
            "user_agent",
            sa.String(length=512),
            nullable=True,
        ),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.Column(
            "last_used_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.Column(
            "expires_at",
            sa.DateTime(timezone=True),
            nullable=False,
        ),
        sa.Column(
            "revoked_at",
            sa.DateTime(timezone=True),
            nullable=True,
        ),
        sa.ForeignKeyConstraint(
            ["user_id"],
            ["users.id"],
            ondelete="CASCADE",
        ),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(
        op.f("ix_user_sessions_user_id"),
        "user_sessions",
        ["user_id"],
        unique=False,
    )


def downgrade() -> None:
    """Remove the persistent user sessions table."""
    op.drop_index(
        op.f("ix_user_sessions_user_id"),
        table_name="user_sessions",
    )
    op.drop_table("user_sessions")
