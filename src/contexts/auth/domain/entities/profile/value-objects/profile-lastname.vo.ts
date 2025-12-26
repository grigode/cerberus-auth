import { StringValueObject } from 'src/contexts/shared/domain';

export class ProfileLastNameVo extends StringValueObject {
  private constructor(value: string) {
    super(value);
  }

  static create(value: string): ProfileLastNameVo {
    return super.validate.call(this, value, {
      minLength: 1,
      maxLength: 32,
    }) as ProfileLastNameVo;
  }
}
