import { StringValueObject } from 'src/contexts/shared/domain';

export class PermissionNameVo extends StringValueObject {
  private constructor(value: string) {
    super(value);
  }

  static create(value: string): PermissionName {
    return super._create.call(this, value, {
      minLength: 1,
      maxLength: 32,
    }) as PermissionName;
  }
}
