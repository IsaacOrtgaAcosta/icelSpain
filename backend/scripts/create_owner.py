from getpass import getpass

from pydantic import ValidationError
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError

from app.core.security import hash_password
from app.db.session import SessionLocal
from app.models.user import User, UserRole
from app.schemas.user import UserCreate


def main() -> None:
    print("Crear propietario de ICEL Spain")

    email_input = input("Email: ").strip()
    full_name_input = input("Nombre completo: ").strip()
    password = getpass("Contraseña: ")
    password_confirmation = getpass("Repite la contraseña: ")

    if password != password_confirmation:
        print("Las contraseñas no coinciden.")
        return

    try:
        owner_data = UserCreate(
            email=email_input,
            password=password,
            full_name=full_name_input or None,
        )
    except ValidationError as error:
        print("Los datos introducidos no son válidos.")

        for validation_error in error.errors():
            print(f"- {validation_error['msg']}")

            return

    email = str(owner_data.email).lower()

    with SessionLocal() as db:
        existing_owner = db.scalar(
            select(User).where(User.role == UserRole.OWNER))

        if existing_owner is not None:
            print(f"Ya existe un propietario: {existing_owner.email}")
            return

        existing_user = db.scalar(select(User).where(User.email == email))

        if existing_user is not None:
            print("Ya existe un usuario con ese email.")
            return
        owner = User(
            email=email,
            full_name=owner_data.full_name,
            hashed_password=hash_password(owner_data.password),
            role=UserRole.OWNER,
        )

        try:
            db.add(owner)
            db.commit()
        except IntegrityError:
            db.rollback()
            print("No se pudo crear el propietario")
            return

        print(f"Propietario creado correctamente: {email}")


if __name__ == "__main__":
    main()
