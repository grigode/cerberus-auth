import { StringValueObject } from 'src/contexts/shared/domain';

export class ConfirmationTokenTokenHashVo extends StringValueObject {
  private constructor(value: string) {
    super(value);
  }

  static create(value: string): ConfirmationTokenTokenHashVo {
    return super.validate.call(this, value, {
      minLength: 64,
      maxLength: 64,
    }) as ConfirmationTokenTokenHashVo;
  }
}
