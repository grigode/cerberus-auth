import { StringValueObject } from 'src/contexts/shared/domain';

export class RoleNameVo extends StringValueObject {
  private constructor(value: string) {
    super(value);
  }

  static create(value: string): RoleNameVo {
    return super._create.call(this, value, {
      minLength: 2,
      maxLength: 32,
    }) as RoleNameVo;
  }
}
