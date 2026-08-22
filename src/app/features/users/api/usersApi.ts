import type { AuthUser } from "@/app/features/auth/types";
import type { ManagedUserCreate } from "../types";

const API_BASE_URL = import.meta.env.VITE_API_URL ?? "http://127.0.0.1:8000";

export class UsersApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "UsersApiError";
    this.status = status;
  }
}

const isUserRole = (value: unknown): value is AuthUser["role"] =>
  value === "owner" || value === "site_manager" || value === "employee";

export const createManagedUser = async (
  userData: ManagedUserCreate,
  accessToken: string,
): Promise<AuthUser> => {
  let response: Response;

  try {
    response = await fetch(`${API_BASE_URL}/api/v1/users`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify(userData),
    });
  } catch {
    throw new UsersApiError("No se pudo conectar con el servidor", 0);
  }

  const data: unknown = await response.json().catch(() => null);

  if (!response.ok) {
    const message =
      typeof data === "object" &&
      data !== null &&
      "detail" in data &&
      typeof data.detail === "string"
        ? data.detail
        : "No se pudo crear el usuario.";

    throw new UsersApiError(message, response.status);
  }

  if (
    typeof data !== "object" ||
    data === null ||
    !("id" in data) ||
    typeof data.id !== "string" ||
    !("email" in data) ||
    typeof data.email !== "string" ||
    !("full_name" in data) ||
    (data.full_name !== null && typeof data.full_name !== "string") ||
    !("role" in data) ||
    !isUserRole(data.role) ||
    !("is_active" in data) ||
    typeof data.is_active !== "boolean" ||
    !("created_at" in data) ||
    typeof data.created_at !== "string"
  ) {
    throw new UsersApiError(
      "El servidor devolvió un usuario inesperado.",
      response.status,
    );
  }

  return {
    id: data.id,
    email: data.email,
    full_name: data.full_name,
    role: data.role,
    is_active: data.is_active,
    created_at: data.created_at,
  };
};
