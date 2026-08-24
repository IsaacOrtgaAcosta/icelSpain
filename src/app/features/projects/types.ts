import type { AuthUser } from "@/app/features/auth/types";

export type ProjectStatus = 
| "planning"
| "active"
| "paused"
| "completed";

export type Project = {
    id: string;
    code: string;
    name: string;
    description: string | null;
    address: string;
    postal_code: string;
    city: string;
    province: string;
    latitude: number | null;
    longitude: number | null;
    status: ProjectStatus;
    created_by_id: string;
    created_at: string;
    updated_at: string;
};

export type ProjectCreate = {
    name: string;
    description: string | null;
    address: string;
    postal_code: string;
    city: string;
    province: string;
    status: ProjectStatus;
};

export type Dwelling = {
    id: string;
    project_id: string;
    code: string;
    number: string;
    description: string | null;
    created_at: string;
    updated_at: string;
};

export type DwellingCreate = {
    number: string;
    description: string | null;
};

export type ProjectDetail = Project & {
    dwellings: Dwelling[];
};

export type ProjectAssignmentCreate = {
    user_id: string;
}

export type ProjectAssignment = {
    id: string;
    project_id: string;
    user_id: string;
    assigned_by_id: string;
    created_at: string;
    user: AuthUser;
}

export type ProjectAssignmentsBulkCreate = {
    user_ids: string[];
};