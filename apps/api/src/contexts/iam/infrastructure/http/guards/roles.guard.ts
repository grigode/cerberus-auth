import {
  type CanActivate,
  type ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
// biome-ignore lint/style/useImportType: Needed as runtime value for NestJS DI metadata
import { Reflector } from '@nestjs/core';
import type { FastifyRequest } from 'fastify';
import type { RoleVo } from '@core/domain';
import type { AuthenticatedUser } from '@core/domain';

import { ROLES_KEY } from '../decorators/roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<RoleVo[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredRoles || requiredRoles.length === 0) {
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
      throw new ForbiddenException('Access denied: Authentication required');
    }

    const hasRole = requiredRoles.some((role) => user.role === role.toString());
    if (!hasRole) {
      throw new ForbiddenException(
        'Access denied: Insufficient permissions for this resource',
      );
    }

    return true;
  }
}
