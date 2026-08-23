import re
import secrets
import unicodedata

CODE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"


def normalize_code_part(
        value: str,
        *,
        max_length: int,
) -> str:
    normalized = unicodedata.normalize("NFKD", value)
    ascii_value = normalized.encode(
        "ascii",
        "ignore",
    ).decode("ascii")

    code_part = re.sub(
        r"[^A-Z0-9]+",
        "-",
        ascii_value.upper(),
    ).strip("-")

    return code_part[:max_length].rstrip("-") or "ITEM"


def generate_random_suffix(length: int) -> str:
    return "".join(
        secrets.choice(CODE_ALPHABET)
        for _ in range(length)
    )


def generate_project_code(project_name: str) -> str:
    name_part = normalize_code_part(
        project_name,
        max_length=50,
    )

    return f"{name_part}--{generate_random_suffix(6)}"


def generate_dwelling_code(
        project_name: str,
        dwelling_number: str,
) -> str:
    project_part = normalize_code_part(
        project_name,
        max_length=45,
    )
    number_part = normalize_code_part(
        dwelling_number,
        max_length=30,
    )

    return (
        f"{project_part}--{number_part}--"
        f"{generate_random_suffix(4)}"
    )
