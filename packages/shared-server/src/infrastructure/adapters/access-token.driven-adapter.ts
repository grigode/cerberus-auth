import { Injectable } from '@nestjs/common';
import type { JwtService } from '@nestjs/jwt';
import type { AccessTokenDrivenPort, UuidVo } from '@core/domain';

@Injectable()
export class AccessTokenDrivenAdapter implements AccessTokenDrivenPort {
  constructor(private readonly jwtService: JwtService) {}

  generateAccessToken(
    userId: UuidVo,
    extraPayload?: Record<string, unknown>,
  ): Promise<string> {
    return this.jwtService.signAsync({
      sub: userId.toString(),
      ...extraPayload,
    });
  }

  validateAccessToken<T extends object>(token: string): Promise<T> {
    return this.jwtService.verifyAsync<T>(token);
  }

  decodeToken<T>(token: string): T {
    return this.jwtService.decode<T>(token);
  }
}
