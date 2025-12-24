import { Role } from '../role';
import { PermissionIdVo, PermissionNameVo } from './value-objects';

export interface PermissionI {
  id: PermissionIdVo | null;
  name: PermissionNameVo;
  roles: Role[] | null;
}

export type PermissionCreateT = Omit<PermissionI, 'id'>;

export interface PermissionResponse {
  name: string;
}

export class Permission implements PermissionI {
  id: PermissionIdVo | null;
  name: PermissionNameVo;
  roles: Role[] | null;

  constructor(attr: PermissionI) {
    this.id = attr.id;
    this.name = attr.name;
    this.roles = attr.roles;
  }

  static create(attrs: PermissionCreateT) {
    return new Permission({
      ...attrs,
      id: null,
    });
  }

  toResponse(): PermissionResponse {
    return {
      name: this.name.value,
    };
  }
}
