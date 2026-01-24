import { ValueObject } from 'src/contexts/shared/domain';

export enum PermissionType {
  READ_SECURITY_EVENTS = 'READ_SECURITY_EVENTS',
  READ_LOGIN_ATTEMPTS = 'READ_LOGIN_ATTEMPTS',
  ASSIGN_ROLE = 'ASSIGN_ROLE',
  CREATE_ROLE = 'CREATE_ROLE',
}

export class Permission extends ValueObject<PermissionType> {}
