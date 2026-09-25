/**
 * Canonical Cerberus backend API error codes
 */
export const ApiErrorCode = {
  INVALID_CREDENTIALS: 'INVALID_CREDENTIALS',
  EMAIL_NOT_VERIFIED: 'EMAIL_NOT_VERIFIED',
  MFA_REQUIRED: 'MFA_REQUIRED',
  INVALID_MFA_TOKEN: 'INVALID_MFA_TOKEN',
  INVALID_MFA_CODE: 'INVALID_MFA_CODE',
  INVALID_BACKUP_CODE: 'INVALID_BACKUP_CODE',
  USER_NOT_FOUND: 'USER_NOT_FOUND',
  USER_ALREADY_EXISTS: 'USER_ALREADY_EXISTS',
  RESET_TOKEN_EXPIRED: 'RESET_TOKEN_EXPIRED',
  RESET_TOKEN_NOT_FOUND: 'RESET_TOKEN_NOT_FOUND',
  INVALID_RESET_TOKEN: 'INVALID_RESET_TOKEN',
  CONFIRMATION_TOKEN_EXPIRED: 'CONFIRMATION_TOKEN_EXPIRED',
  CONFIRMATION_TOKEN_NOT_FOUND: 'CONFIRMATION_TOKEN_NOT_FOUND',
  INVALID_CONFIRMATION_TOKEN: 'INVALID_CONFIRMATION_TOKEN',
  ACCOUNT_DEACTIVATED: 'ACCOUNT_DEACTIVATED',
  TOO_MANY_REQUESTS: 'TOO_MANY_REQUESTS',
} as const;

export type ApiErrorCode = (typeof ApiErrorCode)[keyof typeof ApiErrorCode];

/**
 * Standard HTTP error envelope returned by the API
 */
export interface ApiErrorResponse {
  statusCode: number;
  message: string | string[];
  error?: string;
  code?: ApiErrorCode | string;
  timestamp?: string;
  correlationId?: string;
  path?: string;
}
