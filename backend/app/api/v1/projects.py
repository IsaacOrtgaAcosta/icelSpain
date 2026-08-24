from uuid import UUID

from app.api.dependencies import (
    CurrentUser,
    DatabaseSession,
    ProjectAdminUser,
    ProgressEditorUser,
)
from app.models.dwelling import Dwelling
from app.models.project import Project
from app.models.project_assignment import ProjectAssignment
from app.models.user import User, UserRole
from app.schemas.project import (
    DwellingCreate,
    DwellingRead,
    ProjectCreate,
    ProjectDetail,
    ProjectRead,
)
from app.models.dwelling_progress import (
    DwellingProgress,
    DwellingProgressStage,
)
from app.schemas.project_assignment import (
    ProjectAssignmentCreate,
    ProjectAssignmentRead,
    ProjectAssignmentsBulkCreate,
)
from app.schemas.dwelling_progress import (
    DwellingProgressItemRead,
    DwellingProgressRead,
    DwellingProgressUpdate,
    ProjectProgressItemRead,
    ProjectProgressRead,
)
from app.services.public_codes import (
    generate_dwelling_code,
    generate_project_code,
)
from fastapi import APIRouter, HTTPException, Response, status
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session, selectinload

router = APIRouter(
    prefix="/projects",
    tags=["Projects"],
)

MAX_CODE_GENERATION_ATTEMPTS = 10

FULL_PROJECT_ACCESS_ROLES = {
    UserRole.OWNER,
    UserRole.ARCHITECT,
    UserRole.SITE_MANAGER,
}

INSTALLATION_STAGES = (
    DwellingProgressStage.ELECTRICITY,
    DwellingProgressStage.PLUMBING,
    DwellingProgressStage.AIR_CONDITIONING,
    DwellingProgressStage.SANITATION,
    DwellingProgressStage.HOME_AUTOMATION,
)

MAIN_PROGRESS_STAGES = (
    DwellingProgressStage.STRUCTURE,
    DwellingProgressStage.BRACING,
    DwellingProgressStage.INTERIOR_BOARD,
    DwellingProgressStage.INSULATION,
    DwellingProgressStage.EXTERIOR_BOARD,
    DwellingProgressStage.FACADE,
    DwellingProgressStage.ROOF,
    DwellingProgressStage.CARPENTRY,
)


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


def get_project_dwelling_or_404(
    db: Session,
    project_id: UUID,
    dwelling_id: UUID,
) -> Dwelling:
    dwelling = db.scalar(
        select(Dwelling).where(
            Dwelling.id == dwelling_id,
            Dwelling.project_id == project_id,
        )
    )

    if dwelling is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=(
                "No se encontró la vivienda "
                "dentro de este proyecto."
            ),
        )

    return dwelling


def build_dwelling_progress_response(
    db: Session,
    dwelling_id: UUID,
) -> DwellingProgressRead:
    stored_items = db.scalars(
        select(DwellingProgress).where(
            DwellingProgress.dwelling_id
            == dwelling_id,
        )
    ).all()

    stored_by_stage = {
        item.stage: item
        for item in stored_items
    }

    percentages = {
        stage: (
            stored_by_stage[stage].percentage
            if stage in stored_by_stage
            else 0
        )
        for stage in DwellingProgressStage
    }

    installations_percentage = (
        sum(
            percentages[stage]
            for stage in INSTALLATION_STAGES
        )
        / len(INSTALLATION_STAGES)
    )

    main_percentages = [
        percentages[stage]
        for stage in MAIN_PROGRESS_STAGES
    ]
    main_percentages.append(
        installations_percentage
    )

    overall_percentage = (
        sum(main_percentages)
        / len(main_percentages)
    )

    items = [
        DwellingProgressItemRead(
            stage=stage,
            percentage=percentages[stage],
            updated_by_id=(
                stored_by_stage[stage].updated_by_id
                if stage in stored_by_stage
                else None
            ),
            updated_at=(
                stored_by_stage[stage].updated_at
                if stage in stored_by_stage
                else None
            ),
        )
        for stage in DwellingProgressStage
    ]

    return DwellingProgressRead(
        dwelling_id=dwelling_id,
        items=items,
        installations_percentage=round(
            installations_percentage,
            2,
        ),
        overall_percentage=round(
            overall_percentage,
            2,
        ),
    )


def build_project_progress_response(
    db: Session,
    project_id: UUID,
) -> ProjectProgressRead:
    dwelling_ids = list(
        db.scalars(
            select(Dwelling.id).where(
                Dwelling.project_id == project_id,
            )
        ).all()
    )

    dwelling_count = len(dwelling_ids)

    progress_sums = {
        stage: 0
        for stage in DwellingProgressStage
    }

    if dwelling_ids:
        stored_items = db.scalars(
            select(DwellingProgress).where(
                DwellingProgress.dwelling_id.in_(
                    dwelling_ids
                )
            )
        ).all()

        for item in stored_items:
            progress_sums[item.stage] += (
                item.percentage
            )

    percentages = {
        stage: (
            round(
                progress_sums[stage]
                / dwelling_count,
                2,
            )
            if dwelling_count > 0
            else 0.0
        )
        for stage in DwellingProgressStage
    }

    installations_percentage = (
        sum(
            percentages[stage]
            for stage in INSTALLATION_STAGES
        )
        / len(INSTALLATION_STAGES)
    )

    main_percentages = [
        percentages[stage]
        for stage in MAIN_PROGRESS_STAGES
    ]
    main_percentages.append(
        installations_percentage
    )

    overall_percentage = (
        sum(main_percentages)
        / len(main_percentages)
    )

    return ProjectProgressRead(
        project_id=project_id,
        dwelling_count=dwelling_count,
        items=[
            ProjectProgressItemRead(
                stage=stage,
                percentage=percentages[stage],
            )
            for stage in DwellingProgressStage
        ],
        installations_percentage=round(
            installations_percentage,
            2,
        ),
        overall_percentage=round(
            overall_percentage,
            2,
        ),
    )


def ensure_project_view_access(
    db: Session,
    project: Project,
    current_user: User,
) -> None:
    if current_user.role in FULL_PROJECT_ACCESS_ROLES:
        return

    assignment_id = db.scalar(
        select(ProjectAssignment.id).where(
            ProjectAssignment.project_id == project.id,
            ProjectAssignment.user_id == current_user.id,
        )
    )

    if assignment_id is None:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="No estás asignado a este proyecto.",
        )


def build_assignment_response(
    assignment: ProjectAssignment,
    user: User,
) -> ProjectAssignmentRead:
    return ProjectAssignmentRead(
        id=assignment.id,
        project_id=assignment.project_id,
        user_id=assignment.user_id,
        assigned_by_id=assignment.assigned_by_id,
        created_at=assignment.created_at,
        user=user,
    )


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
    current_user: CurrentUser,
) -> list[Project]:
    statement = select(Project)

    if current_user.role == UserRole.EMPLOYEE:
        statement = (
            statement.join(
                ProjectAssignment,
                ProjectAssignment.project_id == Project.id,
            )
            .where(
                ProjectAssignment.user_id == current_user.id,
            )
        )
    elif current_user.role not in FULL_PROJECT_ACCESS_ROLES:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="No tienes permiso para consultar los proyectos.",
        )

    projects = db.scalars(
        statement.order_by(Project.created_at.desc())
    ).unique().all()

    return list(projects)


@router.get(
    "/{project_id}",
    response_model=ProjectDetail,
)
def get_project(
    project_id: UUID,
    db: DatabaseSession,
    current_user: CurrentUser,
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

    ensure_project_view_access(
        db,
        project,
        current_user,
    )

    return project


@router.get(
    "/{project_id}/progress",
    response_model=ProjectProgressRead,
)
def get_project_progress(
    project_id: UUID,
    db: DatabaseSession,
    current_user: CurrentUser,
) -> ProjectProgressRead:
    project = get_project_or_404(
        db,
        project_id,
    )

    ensure_project_view_access(
        db,
        project,
        current_user,
    )

    return build_project_progress_response(
        db,
        project.id,
    )


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
    current_user: CurrentUser,
) -> list[Dwelling]:
    project = get_project_or_404(
        db,
        project_id,
    )

    ensure_project_view_access(
        db,
        project,
        current_user,
    )

    dwellings = db.scalars(
        select(Dwelling)
        .where(Dwelling.project_id == project.id)
        .order_by(Dwelling.number)
    ).all()

    return list(dwellings)


@router.get(
    "/{project_id}/dwellings/{dwelling_id}/progress",
    response_model=DwellingProgressRead,
)
def get_dwelling_progress(
    project_id: UUID,
    dwelling_id: UUID,
    db: DatabaseSession,
    current_user: CurrentUser,
) -> DwellingProgressRead:
    project = get_project_or_404(
        db,
        project_id,
    )

    ensure_project_view_access(
        db,
        project,
        current_user,
    )

    dwelling = get_project_dwelling_or_404(
        db,
        project.id,
        dwelling_id,
    )

    return build_dwelling_progress_response(
        db,
        dwelling.id,
    )


@router.patch(
    "/{project_id}/dwellings/{dwelling_id}/progress/{stage}",
    response_model=DwellingProgressRead,
)
def update_dwelling_progress(
    project_id: UUID,
    dwelling_id: UUID,
    stage: DwellingProgressStage,
    progress_data: DwellingProgressUpdate,
    db: DatabaseSession,
    current_user: ProgressEditorUser,
) -> DwellingProgressRead:
    project = get_project_or_404(
        db,
        project_id,
    )

    dwelling = get_project_dwelling_or_404(
        db,
        project.id,
        dwelling_id,
    )

    progress = db.scalar(
        select(DwellingProgress).where(
            DwellingProgress.dwelling_id
            == dwelling.id,
            DwellingProgress.stage == stage,
        )
    )

    if progress is None:
        progress = DwellingProgress(
            dwelling_id=dwelling.id,
            stage=stage,
            percentage=progress_data.percentage,
            updated_by_id=current_user.id,
        )
        db.add(progress)
    else:
        progress.percentage = (
            progress_data.percentage
        )
        progress.updated_by_id = (
            current_user.id
        )

    try:
        db.commit()
    except IntegrityError:
        db.rollback()

        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=(
                "No se pudo actualizar "
                "el progreso de la vivienda."
            ),
        ) from None

    return build_dwelling_progress_response(
        db,
        dwelling.id,
    )


@router.get(
    "/{project_id}/assignments",
    response_model=list[ProjectAssignmentRead],
)
def list_project_assignments(
    project_id: UUID,
    db: DatabaseSession,
    current_user: CurrentUser,
) -> list[ProjectAssignmentRead]:
    project = get_project_or_404(
        db,
        project_id,
    )

    ensure_project_view_access(
        db,
        project,
        current_user,
    )

    rows = db.execute(
        select(ProjectAssignment, User)
        .join(
            User,
            User.id == ProjectAssignment.user_id,
        )
        .where(
            ProjectAssignment.project_id == project.id,
        )
        .order_by(
            User.full_name,
            User.email,
        )
    ).all()

    return [
        build_assignment_response(
            assignment,
            user,
        )
        for assignment, user in rows
    ]


@router.post(
    "/{project_id}/assignments/bulk",
    response_model=list[ProjectAssignmentRead],
    status_code=status.HTTP_201_CREATED,
)
def assign_users_to_project(
    project_id: UUID,
    assignment_data: ProjectAssignmentsBulkCreate,
    db: DatabaseSession,
    current_user: ProjectAdminUser,
) -> list[ProjectAssignmentRead]:
    project = get_project_or_404(
        db,
        project_id,
    )

    requested_user_ids = assignment_data.user_ids

    users = list(
        db.scalars(
            select(User).where(
                User.id.in_(requested_user_ids),
            )
        ).all()
    )

    found_user_ids = {
        user.id
        for user in users
    }

    missing_user_ids = (
        requested_user_ids - found_user_ids
    )

    if missing_user_ids:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=(
                "Uno o varios empleados "
                "no existen."
            ),
        )

    invalid_users = [
        user
        for user in users
        if (
            user.role != UserRole.EMPLOYEE
            or not user.is_active
        )
    ]

    if invalid_users:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=(
                "Solo se pueden asignar "
                "empleados activos."
            ),
        )

    existing_user_ids = set(
        db.scalars(
            select(ProjectAssignment.user_id)
            .where(
                ProjectAssignment.project_id
                == project.id,
                ProjectAssignment.user_id.in_(
                    requested_user_ids,
                ),
            )
        ).all()
    )

    new_assignments = [
        ProjectAssignment(
            project_id=project.id,
            user_id=user.id,
            assigned_by_id=current_user.id,
        )
        for user in users
        if user.id not in existing_user_ids
    ]

    try:
        db.add_all(new_assignments)
        db.commit()
    except IntegrityError:
        db.rollback()

        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=(
                "No se pudieron completar "
                "las asignaciones."
            ),
        ) from None

    rows = db.execute(
        select(ProjectAssignment, User)
        .join(
            User,
            User.id == ProjectAssignment.user_id,
        )
        .where(
            ProjectAssignment.project_id
            == project.id,
            ProjectAssignment.user_id.in_(
                requested_user_ids,
            ),
        )
        .order_by(
            User.full_name,
            User.email,
        )
    ).all()

    return [
        build_assignment_response(
            assignment,
            user,
        )
        for assignment, user in rows
    ]


@router.post(
    "/{project_id}/assignments",
    response_model=ProjectAssignmentRead,
    status_code=status.HTTP_201_CREATED,
)
def assign_user_to_project(
    project_id: UUID,
    assignment_data: ProjectAssignmentCreate,
    db: DatabaseSession,
    current_user: ProjectAdminUser,
) -> ProjectAssignmentRead:
    project = get_project_or_404(
        db,
        project_id,
    )

    user = db.get(
        User,
        assignment_data.user_id,
    )

    if user is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No se encontró el usuario.",
        )

    if user.role != UserRole.EMPLOYEE:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Solo se pueden asignar usuarios con rol de empleado.",
        )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No se puede asignar un usuario desactivado.",
        )

    existing_assignment = db.scalar(
        select(ProjectAssignment).where(
            ProjectAssignment.project_id == project.id,
            ProjectAssignment.user_id == user.id,
        )
    )

    if existing_assignment is not None:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="El empleado ya está asignado a este proyecto.",
        )

    assignment = ProjectAssignment(
        project_id=project.id,
        user_id=user.id,
        assigned_by_id=current_user.id,
    )

    try:
        db.add(assignment)
        db.commit()
        db.refresh(assignment)
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="El empleado ya está asignado a este proyecto.",
        ) from None

    return build_assignment_response(
        assignment,
        user,
    )


@router.delete(
    "/{project_id}/assignments/{user_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
def remove_user_from_project(
    project_id: UUID,
    user_id: UUID,
    db: DatabaseSession,
    _current_user: ProjectAdminUser,
) -> Response:
    project = get_project_or_404(
        db,
        project_id,
    )

    assignment = db.scalar(
        select(ProjectAssignment).where(
            ProjectAssignment.project_id == project.id,
            ProjectAssignment.user_id == user_id,
        )
    )

    if assignment is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="El empleado no está asignado a este proyecto.",
        )

    db.delete(assignment)
    db.commit()

    return Response(
        status_code=status.HTTP_204_NO_CONTENT,
    )
