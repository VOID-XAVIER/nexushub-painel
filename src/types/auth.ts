export type UserRole = 'master_root' | 'master_staff' | 'company_admin' | 'seller';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export const ROLE_REDIRECT_MAP: Record<UserRole, string> = {
  master_root: '/master',
  master_staff: '/master',
  company_admin: '/company',
  seller: '/seller',
};

export const ROUTE_ALLOWED_ROLES: Record<string, UserRole[]> = {
  '/master': ['master_root', 'master_staff'],
  '/company': ['company_admin'],
  '/seller': ['seller'],
};
