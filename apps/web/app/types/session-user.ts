import type { UserRole } from './api-contracts';

export type { UserRole };

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
