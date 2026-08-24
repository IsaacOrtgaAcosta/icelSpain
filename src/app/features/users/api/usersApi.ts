import {
  authenticatedFetch,
  AuthApiError,
} from "@/app/features/auth/api/authApi";
import type { AuthUser } from "@/app/features/auth/types";
import type { ManagedUserCreate } from "../types";


export class UsersApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "UsersApiError";
    this.status = status;
  }
}


const isUserRole = (
  value: unknown,
): value is AuthUser["role"] =>
  value === "owner" ||
  value === "architect" ||
  value === "site_manager" ||
  value === "employee";


const isAuthUser = (
  value: unknown,
): value is AuthUser => {
  if (
    typeof value !== "object" ||
    value === null
  ) {
    return false;
  }

  return (
    "id" in value &&
    typeof value.id === "string" &&
    "email" in value &&
    typeof value.email === "string" &&
    "full_name" in value &&
    (
      value.full_name === null ||
      typeof value.full_name === "string"
    ) &&
    "role" in value &&
    isUserRole(value.role) &&
    "is_active" in value &&
    typeof value.is_active === "boolean" &&
    "created_at" in value &&
    typeof value.created_at === "string"
  );
};


const getErrorMessage = (
  data: unknown,
  fallback: string,
): string =>
  typeof data === "object" &&
  data !== null &&
  "detail" in data &&
  typeof data.detail === "string"
    ? data.detail
    : fallback;


const performRequest = async (
  path: string,
  options?: RequestInit,
): Promise<Response> => {
  try {
    return await authenticatedFetch(
      path,
      options,
    );
  } catch (error) {
    if (error instanceof AuthApiError) {
      throw new UsersApiError(
        error.message,
        error.status,
      );
    }

    throw new UsersApiError(
      "No se pudo conectar con el servidor.",
      0,
    );
  }
};


export const createManagedUser = async (
  userData: ManagedUserCreate,
): Promise<AuthUser> => {
  const response = await performRequest(
    "/api/v1/users",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(userData),
    },
  );

  const data: unknown = await response
    .json()
    .catch(() => null);

  if (!response.ok) {
    throw new UsersApiError(
      getErrorMessage(
        data,
        "No se pudo crear el usuario.",
      ),
      response.status,
    );
  }

  if (!isAuthUser(data)) {
    throw new UsersApiError(
      "El servidor devolvió un usuario inesperado.",
      response.status,
    );
  }

  return data;
};


export const listAssignableUsers = async (): Promise<AuthUser[]> => {
  const response = await performRequest(
    "/api/v1/users/assignable",
  );

  const data: unknown = await response
    .json()
    .catch(() => null);

  if (!response.ok) {
    throw new UsersApiError(
      getErrorMessage(
        data,
        "No se pudieron obtener los empleados disponibles.",
      ),
      response.status,
    );
  }

  if (
    !Array.isArray(data) ||
    !data.every(isAuthUser)
  ) {
    throw new UsersApiError(
      "El servidor devolvió una lista de empleados inesperada.",
      response.status,
    );
  }

  return data;
};