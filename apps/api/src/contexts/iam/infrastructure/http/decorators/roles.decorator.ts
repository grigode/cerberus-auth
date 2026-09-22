import { SetMetadata } from '@nestjs/common';
import type { RoleVo } from '@core/domain';

export const ROLES_KEY = Symbol('ROLES_KEY');
export const Roles = (...roles: RoleVo[]) => SetMetadata(ROLES_KEY, roles);
