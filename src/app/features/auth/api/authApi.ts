import type {
  AuthToken,
  AuthUser,
  LoginCredentials,
} from "../types";

const API_BASE_URL =
  import.meta.env.VITE_API_URL ?? "http://localhost:8000";

const statusUnauthorized = 401;

let accessToken: string | null = null;
let refreshRequest: Promise<AuthToken> | null = null;

const isUserRole = (
  value: unknown,
): value is AuthUser["role"] =>
  value === "owner" ||
  value === "architect" ||
  value === "site_manager" ||
  value === "employee";

const getErrorMessage = (
  data: unknown,
  fallbackMessage: string,
): string =>
  typeof data === "object" &&
  data !== null &&
  "detail" in data &&
  typeof data.detail === "string"
    ? data.detail
    : fallbackMessage;

const parseAuthToken = (
  data: unknown,
  status: number,
): AuthToken => {
  if (
    typeof data !== "object" ||
    data === null ||
    !("access_token" in data) ||
    typeof data.access_token !== "string" ||
    !("token_type" in data) ||
    typeof data.token_type !== "string"
  ) {
    throw new AuthApiError(
      "El servidor devolvió una respuesta inesperada.",
      status,
    );
  }

  return {
    access_token: data.access_token,
    token_type: data.token_type,
  };
};

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
    response = await fetch(
      `${API_BASE_URL}/api/v1/auth/login`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(credentials),
      },
    );
  } catch {
    throw new AuthApiError(
      "No se pudo conectar con el servidor.",
      0,
    );
  }

  const data: unknown = await response.json().catch(() => null);

  if (!response.ok) {
    throw new AuthApiError(
      getErrorMessage(data, "No se pudo iniciar sesión."),
      response.status,
    );
  }

  const token = parseAuthToken(data, response.status);
  accessToken = token.access_token;

  return token;
};

const performRefresh = async (): Promise<AuthToken> => {
  let response: Response;

  try {
    response = await fetch(
      `${API_BASE_URL}/api/v1/auth/refresh`,
      {
        method: "POST",
        credentials: "include",
      },
    );
  } catch {
    throw new AuthApiError(
      "No se pudo conectar con el servidor.",
      0,
    );
  }

  const data: unknown = await response.json().catch(() => null);

  if (!response.ok) {
    accessToken = null;

    throw new AuthApiError(
      getErrorMessage(
        data,
        "La sesión no es válida o ha expirado.",
      ),
      response.status,
    );
  }

  const token = parseAuthToken(data, response.status);
  accessToken = token.access_token;

  return token;
};

export const refreshAccessToken =
  async (): Promise<AuthToken> => {
    if (refreshRequest === null) {
      refreshRequest = performRefresh().finally(() => {
        refreshRequest = null;
      });
    }

    return refreshRequest;
  };

export const authenticatedFetch = async (
  path: string,
  options: RequestInit = {},
): Promise<Response> => {
  const sendRequest = async (
    token: string,
  ): Promise<Response> => {
    const headers = new Headers(options.headers);
    headers.set("Authorization", `Bearer ${token}`);

    try {
      return await fetch(`${API_BASE_URL}${path}`, {
        ...options,
        headers,
        credentials: "include",
      });
    } catch {
      throw new AuthApiError(
        "No se pudo conectar con el servidor.",
        0,
      );
    }
  };

  let currentToken = accessToken;

  if (currentToken === null) {
    const refreshedToken = await refreshAccessToken();
    currentToken = refreshedToken.access_token;
  }

  let response = await sendRequest(currentToken);

  if (response.status === statusUnauthorized) {
    accessToken = null;

    const refreshedToken = await refreshAccessToken();
    response = await sendRequest(refreshedToken.access_token);

    if (response.status === statusUnauthorized) {
      accessToken = null;
    }
  }

  return response;
};

export const logout = async (): Promise<void> => {
  let response: Response;

  try {
    response = await fetch(
      `${API_BASE_URL}/api/v1/auth/logout`,
      {
        method: "POST",
        credentials: "include",
      },
    );
  } catch {
    throw new AuthApiError(
      "No se pudo conectar con el servidor.",
      0,
    );
  }

  if (!response.ok) {
    const data: unknown = await response
      .json()
      .catch(() => null);

    throw new AuthApiError(
      getErrorMessage(data, "No se pudo cerrar la sesión."),
      response.status,
    );
  }

  accessToken = null;
};

export const getCurrentUser = async (): Promise<AuthUser> => {
  const response = await authenticatedFetch(
    "/api/v1/auth/me",
    {
      method: "GET",
    },
  );

  const data: unknown = await response.json().catch(() => null);

  if (!response.ok) {
    throw new AuthApiError(
      getErrorMessage(
        data,
        "La sesión no es válida o ha expirado.",
      ),
      response.status,
    );
  }

  if (
    typeof data !== "object" ||
    data === null ||
    !("id" in data) ||
    typeof data.id !== "string" ||
    !("email" in data) ||
    typeof data.email !== "string" ||
    !("full_name" in data) ||
    (data.full_name !== null &&
      typeof data.full_name !== "string") ||
    !("role" in data) ||
    !isUserRole(data.role) ||
    !("is_active" in data) ||
    typeof data.is_active !== "boolean" ||
    !("created_at" in data) ||
    typeof data.created_at !== "string"
  ) {
    throw new AuthApiError(
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