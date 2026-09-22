export interface GetActiveSessionsDto {
  userId: string;
  currentRefreshToken?: string;
}

export interface UserSessionData {
  id: string;
  userAgent?: string;
  ipAddress?: string;
  createdAt: Date;
  expiresAt: Date;
  lastUsedAt?: Date;
  isCurrent: boolean;
}
