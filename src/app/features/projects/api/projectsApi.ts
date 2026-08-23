import {
  authenticatedFetch,
  AuthApiError,
} from "@/app/features/auth/api/authApi";

import type {
  Dwelling,
  DwellingCreate,
  Project,
  ProjectCreate,
  ProjectDetail,
  ProjectStatus,
} from "../types";


export class ProjectsApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "ProjectsApiError";
    this.status = status;
  }
}


const isProjectStatus = (
  value: unknown,
): value is ProjectStatus =>
  value === "planning" ||
  value === "active" ||
  value === "paused" ||
  value === "completed";


const isNullableString = (
  value: unknown,
): value is string | null =>
  value === null || typeof value === "string";


const isNullableNumber = (
  value: unknown,
): value is number | null =>
  value === null || typeof value === "number";


const isProject = (
  value: unknown,
): value is Project => {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  return (
    "id" in value &&
    typeof value.id === "string" &&
    "code" in value &&
    typeof value.code === "string" &&
    "name" in value &&
    typeof value.name === "string" &&
    "description" in value &&
    isNullableString(value.description) &&
    "address" in value &&
    typeof value.address === "string" &&
    "postal_code" in value &&
    typeof value.postal_code === "string" &&
    "city" in value &&
    typeof value.city === "string" &&
    "province" in value &&
    typeof value.province === "string" &&
    "latitude" in value &&
    isNullableNumber(value.latitude) &&
    "longitude" in value &&
    isNullableNumber(value.longitude) &&
    "status" in value &&
    isProjectStatus(value.status) &&
    "created_by_id" in value &&
    typeof value.created_by_id === "string" &&
    "created_at" in value &&
    typeof value.created_at === "string" &&
    "updated_at" in value &&
    typeof value.updated_at === "string"
  );
};


const isDwelling = (
  value: unknown,
): value is Dwelling => {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  return (
    "id" in value &&
    typeof value.id === "string" &&
    "project_id" in value &&
    typeof value.project_id === "string" &&
    "code" in value &&
    typeof value.code === "string" &&
    "number" in value &&
    typeof value.number === "string" &&
    "description" in value &&
    isNullableString(value.description) &&
    "created_at" in value &&
    typeof value.created_at === "string" &&
    "updated_at" in value &&
    typeof value.updated_at === "string"
  );
};


const getResponseData = async (
  response: Response,
): Promise<unknown> =>
  response.json().catch(() => null);


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
    return await authenticatedFetch(path, options);
  } catch (error) {
    if (error instanceof AuthApiError) {
      throw new ProjectsApiError(
        error.message,
        error.status,
      );
    }

    throw new ProjectsApiError(
      "No se pudo conectar con el servidor.",
      0,
    );
  }
};


export const listProjects = async (): Promise<Project[]> => {
  const response = await performRequest("/api/v1/projects");
  const data = await getResponseData(response);

  if (!response.ok) {
    throw new ProjectsApiError(
      getErrorMessage(
        data,
        "No se pudieron obtener los proyectos.",
      ),
      response.status,
    );
  }

  if (!Array.isArray(data) || !data.every(isProject)) {
    throw new ProjectsApiError(
      "El servidor devolvió una lista de proyectos inesperada.",
      response.status,
    );
  }

  return data;
};


export const createProject = async (
  projectData: ProjectCreate,
): Promise<Project> => {
  const response = await performRequest(
    "/api/v1/projects",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(projectData),
    },
  );

  const data = await getResponseData(response);

  if (!response.ok) {
    throw new ProjectsApiError(
      getErrorMessage(
        data,
        "No se pudo crear el proyecto.",
      ),
      response.status,
    );
  }

  if (!isProject(data)) {
    throw new ProjectsApiError(
      "El servidor devolvió un proyecto inesperado.",
      response.status,
    );
  }

  return data;
};


export const getProject = async (
  projectId: string,
): Promise<ProjectDetail> => {
  const response = await performRequest(
    `/api/v1/projects/${encodeURIComponent(projectId)}`,
  );

  const data = await getResponseData(response);

  if (
    !response.ok
  ) {
    throw new ProjectsApiError(
      getErrorMessage(
        data,
        "No se pudo obtener el proyecto.",
      ),
      response.status,
    );
  }

  if (
    !isProject(data) ||
    !("dwellings" in data) ||
    !Array.isArray(data.dwellings) ||
    !data.dwellings.every(isDwelling)
  ) {
    throw new ProjectsApiError(
      "El servidor devolvió un proyecto inesperado.",
      response.status,
    );
  }

  return {
    ...data,
    dwellings: data.dwellings,
  };
};


export const createDwelling = async (
  projectId: string,
  dwellingData: DwellingCreate,
): Promise<Dwelling> => {
  const response = await performRequest(
    `/api/v1/projects/${encodeURIComponent(projectId)}/dwellings`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(dwellingData),
    },
  );

  const data = await getResponseData(response);

  if (!response.ok) {
    throw new ProjectsApiError(
      getErrorMessage(
        data,
        "No se pudo crear la vivienda.",
      ),
      response.status,
    );
  }

  if (!isDwelling(data)) {
    throw new ProjectsApiError(
      "El servidor devolvió una vivienda inesperada.",
      response.status,
    );
  }

  return data;
};