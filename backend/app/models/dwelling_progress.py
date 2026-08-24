from datetime import datetime
from enum import StrEnum
from uuid import UUID, uuid4

from app.db.base import Base
from sqlalchemy import (
    CheckConstraint,
    DateTime,
    Enum,
    ForeignKey,
    SmallInteger,
    UniqueConstraint,
    func,
)
from sqlalchemy.dialects.postgresql import UUID as PostgreSQLUUID
from sqlalchemy.orm import Mapped, mapped_column


class DwellingProgressStage(StrEnum):
    STRUCTURE = "structure"
    ELECTRICITY = "electricity"
    PLUMBING = "plumbing"
    AIR_CONDITIONING = "air_conditioning"
    SANITATION = "sanitation"
    HOME_AUTOMATION = "home_automation"
    BRACING = "bracing"
    INTERIOR_BOARD = "interior_board"
    INSULATION = "insulation"
    EXTERIOR_BOARD = "exterior_board"
    FACADE = "facade"
    ROOF = "roof"
    CARPENTRY = "carpentry"


class DwellingProgress(Base):
    __tablename__ = "dwelling_progress"
    __table_args__ = (
        UniqueConstraint(
            "dwelling_id",
            "stage",
            name="uq_dwelling_progress_dwelling_stage",
        ),
        CheckConstraint(
            "percentage >= 0 AND percentage <= 100",
            name="ck_dwelling_progress_percentage",
        ),
    )

    id: Mapped[UUID] = mapped_column(
        PostgreSQLUUID(as_uuid=True),
        primary_key=True,
        default=uuid4,
    )
    dwelling_id: Mapped[UUID] = mapped_column(
        PostgreSQLUUID(as_uuid=True),
        ForeignKey(
            "dwellings.id",
            ondelete="CASCADE",
        ),
        index=True,
        nullable=False,
    )
    stage: Mapped[DwellingProgressStage] = mapped_column(
        Enum(
            DwellingProgressStage,
            name="dwelling_progress_stage",
            values_callable=lambda stages: [
                stage.value
                for stage in stages
            ],
        ),
        nullable=False,
    )
    percentage: Mapped[int] = mapped_column(
        SmallInteger,
        default=0,
        server_default="0",
        nullable=False,
    )
    updated_by_id: Mapped[UUID] = mapped_column(
        PostgreSQLUUID(as_uuid=True),
        ForeignKey(
            "users.id",
            ondelete="RESTRICT",
        ),
        nullable=False,
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )
