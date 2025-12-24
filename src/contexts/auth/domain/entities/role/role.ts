import { User, Permission } from '..';
import { RoleIdVo, RoleNameVo } from './value-objects';

export interface RoleI {
  id: RoleIdVo | null;
  name: RoleNameVo;
  users: User[] | null;
  permisions: Permission[] | null;
}

export type RoleCreateT = Omit<RoleI, 'id'>;

export interface RoleResponse {
  name: string;
}

export class Role implements RoleI {
  id: RoleIdVo | null;
  name: RoleNameVo;
  users: User[] | null;
  permisions: Permission[] | null;

  constructor(attr: RoleI) {
    this.id = attr.id;
    this.name = attr.name;
    this.users = attr.users;
    this.permisions = attr.permisions;
  }

  static create(attrs: RoleCreateT) {
    return new Role({
      ...attrs,
      id: null,
    });
  }

  toResponse(): RoleResponse {
    return {
      name: this.name.value,
    };
  }
}
