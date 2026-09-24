import {
  type CanActivate,
  type ExecutionContext,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type { FastifyRequest } from 'fastify';
import { UnauthorizedException } from '@core/shared-server';
import type { AuthenticatedUser } from '@core/domain';

import { IS_PUBLIC_KEY } from '../decorators/public.decorator';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest<
      FastifyRequest & {
        user?: AuthenticatedUser;
        raw?: { user?: AuthenticatedUser };
      }
    >();
    const user = request.user || request.raw?.user;
    if (!user) {
      throw new UnauthorizedException(
        'UNAUTHORIZED',
        'Authentication required',
      );
    }

    return true;
  }
}
