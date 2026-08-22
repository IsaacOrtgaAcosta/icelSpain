"""add user roles

Revision ID: 1c5b34022fb7
Revises: 184d6b51d94d
Create Date: 2026-08-22 01:21:08.547000
"""

from typing import Sequence, Union

import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

from alembic import op


# revision identifiers, used by Alembic.
revision: str = "1c5b34022fb7"
down_revision: Union[str, Sequence[str], None] = "184d6b51d94d"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


USER_ROLE_ENUM = postgresql.ENUM(
    "owner",
    "site_manager",
    "employee",
    name="user_role",
    create_type=False,
)


def upgrade() -> None:
    """Add a role to every user."""
    USER_ROLE_ENUM.create(op.get_bind(), checkfirst=True)

    op.add_column(
        "users",
        sa.Column(
            "role",
            USER_ROLE_ENUM,
            server_default="employee",
            nullable=False,
        ),
    )


def downgrade() -> None:
    """Remove user roles."""
    op.drop_column("users", "role")
    USER_ROLE_ENUM.drop(op.get_bind(), checkfirst=True)