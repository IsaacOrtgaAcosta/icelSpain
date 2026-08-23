from uuid import UUID

from app.api.dependencies import (
    DatabaseSession,
    ProjectAdminUser,
    ProjectOverviewUser,
)
from app.models.dwelling import Dwelling
from app.models.project import Project
from app.schemas.project import (
    DwellingCreate,
    DwellingRead,
    ProjectCreate,
    ProjectDetail,
    ProjectRead,
)
from app.services.public_codes import (
    generate_dwelling_code,
    generate_project_code,
)
from fastapi import APIRouter, HTTPException, status
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session, selectinload

router = APIRouter(
    prefix="/projects",
    tags=["Projects"],
)

MAX_CODE_GENERATION_ATTEMPTS = 10


def generate_available_project_code(
    db: Session,
    project_name: str,
) -> str:
    for _ in range(MAX_CODE_GENERATION_ATTEMPTS):
        code = generate_project_code(project_name)

        existing_project_id = db.scalar(
            select(Project.id).where(Project.code == code)
        )

        if existing_project_id is None:
            return code

    raise HTTPException(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        detail="No se pudo generar un código único para el proyecto.",
    )


def generate_available_dwelling_code(
    db: Session,
    project_name: str,
    dwelling_number: str,
) -> str:
    for _ in range(MAX_CODE_GENERATION_ATTEMPTS):
        code = generate_dwelling_code(
            project_name,
            dwelling_number,
        )

        existing_dwelling_id = db.scalar(
            select(Dwelling.id).where(Dwelling.code == code)
        )

        if existing_dwelling_id is None:
            return code

    raise HTTPException(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        detail="No se pudo generar un código único para la vivienda.",
    )


def get_project_or_404(
    db: Session,
    project_id: UUID,
) -> Project:
    project = db.get(Project, project_id)

    if project is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No se encontró el proyecto.",
        )

    return project


@router.post(
    "",
    response_model=ProjectRead,
    status_code=status.HTTP_201_CREATED,
)
def create_project(
    project_data: ProjectCreate,
    db: DatabaseSession,
    current_user: ProjectAdminUser,
) -> Project:
    project = Project(
        code=generate_available_project_code(
            db,
            project_data.name,
        ),
        name=project_data.name,
        description=project_data.description,
        address=project_data.address,
        postal_code=project_data.postal_code,
        city=project_data.city,
        province=project_data.province,
        status=project_data.status,
        created_by_id=current_user.id,
    )

    try:
        db.add(project)
        db.commit()
        db.refresh(project)
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="No se pudo crear el proyecto.",
        ) from None

    return project


@router.get(
    "",
    response_model=list[ProjectRead],
)
def list_projects(
    db: DatabaseSession,
    _current_user: ProjectOverviewUser,
) -> list[Project]:
    projects = db.scalars(
        select(Project).order_by(Project.created_at.desc())
    ).all()

    return list(projects)


@router.get(
    "/{project_id}",
    response_model=ProjectDetail,
)
def get_project(
    project_id: UUID,
    db: DatabaseSession,
    _current_user: ProjectOverviewUser,
) -> Project:
    project = db.scalar(
        select(Project)
        .options(selectinload(Project.dwellings))
        .where(Project.id == project_id)
    )

    if project is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No se encontró el proyecto.",
        )

    return project


@router.post(
    "/{project_id}/dwellings",
    response_model=DwellingRead,
    status_code=status.HTTP_201_CREATED,
)
def create_dwelling(
    project_id: UUID,
    dwelling_data: DwellingCreate,
    db: DatabaseSession,
    _current_user: ProjectAdminUser,
) -> Dwelling:
    project = get_project_or_404(
        db,
        project_id,
    )

    existing_dwelling = db.scalar(
        select(Dwelling).where(
            Dwelling.project_id == project.id,
            Dwelling.number == dwelling_data.number,
        )
    )

    if existing_dwelling is not None:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=(
                "Ya existe una vivienda con ese número "
                "dentro del proyecto."
            ),
        )

    dwelling = Dwelling(
        project_id=project.id,
        code=generate_available_dwelling_code(
            db,
            project.name,
            dwelling_data.number,
        ),
        number=dwelling_data.number,
        description=dwelling_data.description,
    )

    try:
        db.add(dwelling)
        db.commit()
        db.refresh(dwelling)
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="No se pudo crear la vivienda.",
        ) from None

    return dwelling


@router.get(
    "/{project_id}/dwellings",
    response_model=list[DwellingRead],
)
def list_project_dwellings(
    project_id: UUID,
    db: DatabaseSession,
    _current_user: ProjectOverviewUser,
) -> list[Dwelling]:
    project = get_project_or_404(
        db,
        project_id,
    )

    dwellings = db.scalars(
        select(Dwelling)
        .where(Dwelling.project_id == project.id)
        .order_by(Dwelling.number)
    ).all()

    return list(dwellings)