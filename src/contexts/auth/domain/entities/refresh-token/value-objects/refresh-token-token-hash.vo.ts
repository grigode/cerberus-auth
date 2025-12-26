import { StringValueObject } from 'src/contexts/shared/domain';

export class RefreshTokenTokenHashVo extends StringValueObject {
  private constructor(value: string) {
    super(value);
  }

  static create(value: string): RefreshTokenTokenHashVo {
    return super.validate.call(this, value, {
      minLength: 64,
      maxLength: 64,
    }) as RefreshTokenTokenHashVo;
  }
}
