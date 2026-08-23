"""add architect role

Revision ID: 41609e5d8273
Revises: 5e2a3b931b9b
Create Date: 2026-08-23 16:08:50.888072
"""

from alembic import op

revision = "41609e5d8273"
down_revision = "5e2a3b931b9b"
branch_labels = None
depends_on = None


def upgrade() -> None:
    """Add architect to the available user roles."""
    op.execute(
        """
        ALTER TYPE user_role
        ADD VALUE IF NOT EXISTS 'architect'
        AFTER 'owner'
        """
    )


def downgrade() -> None:
    """Remove architect from the available user roles."""
    op.execute(
        """
        UPDATE users
        SET role = 'employee'
        WHERE role = 'architect'
        """
    )

    op.execute(
        """
        ALTER TABLE users
        ALTER COLUMN role DROP DEFAULT
        """
    )

    op.execute(
        """
        ALTER TYPE user_role
        RENAME TO user_role_with_architect
        """
    )

    op.execute(
        """
        CREATE TYPE user_role AS ENUM (
            'owner',
            'site_manager',
            'employee'
        )
        """
    )

    op.execute(
        """
        ALTER TABLE users
        ALTER COLUMN role TYPE user_role
        USING role::text::user_role
        """
    )

    op.execute(
        """
        ALTER TABLE users
        ALTER COLUMN role SET DEFAULT 'employee'
        """
    )

    op.execute(
        """
        DROP TYPE user_role_with_architect
        """
    )
