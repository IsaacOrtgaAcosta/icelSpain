from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, Field

from app.models.dwelling_progress import DwellingProgressStage


class DwellingProgressUpdate(BaseModel):
    percentage: int = Field(
        ge=0,
        le=100,
    )


class DwellingProgressItemRead(BaseModel):
    stage: DwellingProgressStage
    percentage: int
    updated_by_id: UUID | None
    updated_at: datetime | None


class DwellingProgressRead(BaseModel):
    dwelling_id: UUID
    items: list[DwellingProgressItemRead]
    installations_percentage: float
    overall_percentage: float


class ProjectProgressItemRead(BaseModel):
    stage: DwellingProgressStage
    percentage: float


class ProjectProgressRead(BaseModel):
    project_id: UUID
    dwelling_count: int
    items: list[ProjectProgressItemRead]
    installations_percentage: float
    overall_percentage: float