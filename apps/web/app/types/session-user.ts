export type UserRole = 'SUPERADMIN' | 'ADMIN' | 'STAFF' | 'USER';

export interface SessionUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role?: UserRole;
  isMfaEnabled?: boolean;
  avatarUrl?: string;
  language?: string;
}
