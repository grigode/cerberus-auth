import { StringValueObject } from 'src/contexts/shared/domain';

export class PermissionNameVo extends StringValueObject {
  private constructor(value: string) {
    super(value);
  }

  static create(value: string): PermissionNameVo {
    return super.validate.call(this, value, {
      minLength: 1,
      maxLength: 32,
    }) as PermissionNameVo;
  }
}
