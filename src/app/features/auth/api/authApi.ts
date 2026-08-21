import type { AuthToken, LoginCredentials } from "../types";

const API_BASE_URL =
  import.meta.env.VITE_API_URL ?? "http://127.0.0.1:8000";

export class AuthApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.name = "AuthApiError";
    this.status = status;
  }
}

export const login = async (
  credentials: LoginCredentials,
): Promise<AuthToken> => {
  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}/api/v1/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(credentials),
    });
  } catch {
    throw new AuthApiError('No se pudo conectar con el servidor', 0);
  }

  const data: unknown = await response.json().catch(() => null);

  if (!response.ok) {
    const message =
      typeof data === "object" &&
      data !== null &&
      'detail' in data &&
      typeof data.detail === "string"
        ? data.detail
        : "No se pudo iniciar sesión";
    throw new AuthApiError(message, response.status);
  }

  if (
    typeof data !== "object" ||
    data === null ||
    !("access_token" in data) ||
    typeof data.access_token !== "string" ||
    !("token_type" in data) ||
    typeof data.token_type !== "string" 
  ) {
    throw new AuthApiError(
      "El servidor devolvió una respuesta inesperada",
      response.status,
    );
  }

  return {
    access_token: data.access_token,
    token_type: data.token_type,
  };
};
