import { AggregateRoot } from 'src/contexts/shared/domain';

import { Permission, RoleId } from './value-objects';

export interface RoleAttr {
  id: RoleId;
  permissions: Permission[];
}

export class Role extends AggregateRoot {
  readonly id: RoleId;
  readonly permissions: Permission[];

  private constructor(attr: RoleAttr) {
    super();
    this.id = attr.id;
    this.permissions = attr.permissions;
  }

  static create(attr: RoleAttr): Role {
    return new Role(attr);
  }

  hasPermission(permission: Permission): boolean {
    return this.permissions.includes(permission);
  }
}
