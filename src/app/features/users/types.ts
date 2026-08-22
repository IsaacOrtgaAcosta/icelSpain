import type { UserRole } from '@/app/features/auth/types';

export type ManagedUserRole = Exclude<UserRole, 'owner'>;

export type ManagedUserCreate = {
    email: string;
    password: string;
    full_name: string;
    role: ManagedUserRole;
};