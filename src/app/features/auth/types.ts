export type LoginCredentials = {
    email: string;
    password: string;
};

export type AuthToken = {
    access_token: string;
    token_type: string;
}

export type AuthUser = {
    id: string;
    email: string;
    full_name: string | null;
    is_active: boolean;
    created_at: string;
}