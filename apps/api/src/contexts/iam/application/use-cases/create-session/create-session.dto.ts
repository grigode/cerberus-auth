import type { User } from '@core/domain';

export interface CreateSessionDto {
  user: User;
  userAgent?: string;
  ipAddress?: string;
}
