import { ValueObject } from 'src/contexts/shared/domain';

export enum RoleType {
  USER = 'USER',
  ADMIN = 'ADMIN',
  SUPERADMIN = 'SUPERADMIN',
}

export class RoleId extends ValueObject<RoleType> {
  private constructor(value: RoleType) {
    super(value);
  }

  static of(value: RoleType): RoleId {
    return new RoleId(value);
  }
}
