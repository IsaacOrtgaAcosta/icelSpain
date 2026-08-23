export type LoginCredentials = {
  email: string;
  password: string;
};

export type AuthToken = {
  access_token: string;
  token_type: string;
};

export type UserRole = "owner" | "architect" | "site_manager" | "employee";

export type AuthUser = {
  id: string;
  email: string;
  full_name: string | null;
  role: UserRole;
  is_active: boolean;
  created_at: string;
};
