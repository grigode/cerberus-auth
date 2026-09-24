import {
  type CanActivate,
  type ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type { FastifyRequest } from 'fastify';
import { RoleVo } from '@core/domain';
import type { AuthenticatedUser } from '@core/domain';

import { ROLES_KEY } from '../decorators/roles.decorator';

const ROLE_HIERARCHY: Record<string, number> = {
  [RoleVo.USER]: 1,
  [RoleVo.STAFF]: 2,
  [RoleVo.ADMIN]: 3,
  [RoleVo.SUPERADMIN]: 4,
};

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

    const userRoleLevel = ROLE_HIERARCHY[user.role] ?? 0;
    const hasRole = requiredRoles.some((role) => {
      const requiredLevel = ROLE_HIERARCHY[role.toString()] ?? 999;
      return userRoleLevel >= requiredLevel;
    });

    if (!hasRole) {
      throw new ForbiddenException(
        'Access denied: Insufficient permissions for this resource',
      );
    }

    return true;
  }
}
