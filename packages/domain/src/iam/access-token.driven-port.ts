import type { UuidVo } from '../common';

export interface AccessTokenDrivenPort {
  generateAccessToken(
    userId: UuidVo,
    payload?: Record<string, unknown>,
  ): Promise<string>;
  validateAccessToken<T extends object>(token: string): Promise<T>;
  decodeToken<T>(token: string): T;
}
