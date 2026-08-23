from datetime import datetime
from uuid import UUID

from app.models.project import ProjectStatus
from pydantic import BaseModel, ConfigDict, Field


class ProjectCreate(BaseModel):
    model_config = ConfigDict(
        str_strip_whitespace=True,
    )

    name: str = Field(
        min_length=1,
        max_length=160,
    )
    description: str | None = Field(
        default=None,
        max_length=3000,
    )
    address: str = Field(
        min_length=1,
        max_length=255,
    )
    postal_code: str = Field(
        min_length=3,
        max_length=20,
    )
    city: str = Field(
        min_length=1,
        max_length=120,
    )
    province: str = Field(
        min_length=1,
        max_length=120,
    )
    status: ProjectStatus = ProjectStatus.PLANNING


class DwellingCreate(BaseModel):
    model_config = ConfigDict(
        str_strip_whitespace=True,
    )

    number: str = Field(
        min_length=1,
        max_length=60,
    )
    description: str | None = Field(
        default=None,
        max_length=3000,
    )


class DwellingRead(BaseModel):
    model_config = ConfigDict(
        from_attributes=True,
    )

    id: UUID
    project_id: UUID
    code: str
    number: str
    description: str | None
    created_at: datetime
    updated_at: datetime


class ProjectRead(BaseModel):
    model_config = ConfigDict(
        from_attributes=True,
    )

    id: UUID
    code: str
    name: str
    description: str | None
    address: str
    postal_code: str
    city: str
    province: str
    latitude: float | None
    longitude: float | None
    status: ProjectStatus
    created_by_id: UUID
    created_at: datetime
    updated_at: datetime


class ProjectDetail(ProjectRead):
    dwellings: list[DwellingRead]