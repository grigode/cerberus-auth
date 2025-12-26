import { StringValueObject } from 'src/contexts/shared/domain';

export class ProfileProfileImageVo extends StringValueObject {
  private constructor(value: string) {
    super(value);
  }

  static create(value: string): ProfileProfileImageVo {
    return super.validate.call(this, value, {
      minLength: 1,
      maxLength: 255,
    }) as ProfileProfileImageVo;
  }
}
