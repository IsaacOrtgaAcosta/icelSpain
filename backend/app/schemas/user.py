from datetime import datetime
from uuid import UUID
from app.models.user import UserRole
from typing import Literal
from pydantic import BaseModel, ConfigDict, EmailStr, Field


class UserCreate(BaseModel):
    email: EmailStr
    password: str = Field(min_length=12, max_length=128)
    full_name: str | None = Field(default=None, max_length=120)


class UserRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    email: EmailStr
    full_name: str | None
    role: UserRole
    is_active: bool
    created_at: datetime


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"

# Permitimos crear usuarios con roles site_manager y employee.
# Pero nunca owner. El owner se crea manualmente mediante el script.


class ManagedUserCreate(BaseModel):
    email: EmailStr
    password: str = Field(min_length=12, max_length=128)
    full_name: str = Field(min_length=1, max_length=120)
    role: Literal[
        UserRole.SITE_MANAGER,
        UserRole.EMPLOYEE,
    ]
