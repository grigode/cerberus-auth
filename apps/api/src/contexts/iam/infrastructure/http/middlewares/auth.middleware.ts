import {
  Inject,
  Injectable,
  Logger,
  type NestMiddleware,
} from '@nestjs/common';
import type { FastifyReply, FastifyRequest } from 'fastify';
import { USER_DRIVEN_PORT_TOKEN, type UserDrivenPort } from '@core/domain';
import {
  ACCESS_TOKEN_DRIVEN_PORT_TOKEN,
  type AccessTokenDrivenPort,
  type AuthenticatedUser,
} from '@core/domain';

export type RequestWithUser = FastifyRequest & {
  user?: AuthenticatedUser;
  cookies: Record<string, string | undefined>;
  raw: FastifyRequest['raw'] & { user?: AuthenticatedUser };
};

@Injectable()
export class AuthMiddleware implements NestMiddleware {
  private readonly logger = new Logger(AuthMiddleware.name);

  constructor(
    @Inject(ACCESS_TOKEN_DRIVEN_PORT_TOKEN)
    private readonly accessTokenPort: AccessTokenDrivenPort,
    @Inject(USER_DRIVEN_PORT_TOKEN)
    private readonly userDrivenPort: UserDrivenPort,
  ) {}

  async use(
    req: RequestWithUser,
    _: FastifyReply,
    next: (error?: unknown) => void,
  ) {
    const token = this.extractToken(req);

    if (token) {
      try {
        const payload = await this.accessTokenPort.validateAccessToken<{
          sub: string;
        }>(token);

        if (payload?.sub) {
          const user = await this.userDrivenPort.findById(payload.sub);

          if (user?.data.isActive) {
            const authenticatedUser: AuthenticatedUser = {
              id: user.data.id.toString(),
              email: user.data.email,
              role: user.data.role,
              isActive: user.data.isActive,
              isEmailVerified: user.data.isEmailVerified,
            };

            req.user = authenticatedUser;
            if (req.raw) {
              req.raw.user = authenticatedUser;
            }
          }
        }
      } catch (error: unknown) {
        // Token validation/expiration failure is normal for expired sessions.
        // Log at debug level to avoid swallowing database/system errors completely.
        this.logger.debug(
          `Token validation failed: ${error instanceof Error ? error.message : String(error)}`,
        );
      }
    }

    next();
  }

  private extractToken(req: RequestWithUser): string | null {
    const authHeader = req.headers.authorization || req.headers.Authorization;
    const BEARER_PREFIX = 'Bearer ';

    if (
      typeof authHeader === 'string' &&
      authHeader.startsWith(BEARER_PREFIX)
    ) {
      return authHeader.slice(BEARER_PREFIX.length).trim();
    }

    if (req.cookies?.access_token) {
      return req.cookies.access_token;
    }

    const cookieHeader = req.headers.cookie;
    if (typeof cookieHeader === 'string') {
      const match = cookieHeader.match(/(?:^|;\s*)access_token=([^;]+)/);
      if (match) {
        return match[1];
      }
    }

    return null;
  }
}
