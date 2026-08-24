from datetime import datetime
from uuid import UUID
from app.schemas.user import UserRead
from pydantic import BaseModel, ConfigDict, Field


class ProjectAssignmentCreate(BaseModel):
    user_id: UUID


class ProjectAssignmentsBulkCreate(BaseModel):
    user_ids: set[UUID] = Field(
        min_length=1,
        max_length=100,
    )


class ProjectAssignmentRead(BaseModel):
    model_config = ConfigDict(
        from_attributes=True,
    )

    id: UUID
    project_id: UUID
    user_id: UUID
    assigned_by_id: UUID
    created_at: datetime
    user: UserRead
