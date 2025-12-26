import { StringValueObject, ValidationError } from 'src/contexts/shared/domain';

export class UserPasswordVo extends StringValueObject {
  private constructor(value: string) {
    super(value);
  }

  static create(value: string): UserPasswordVo {
    if (/\s/.test(value))
      throw new ValidationError('Password must not contain spaces');

    if (!/[a-zA-Z]/.test(value))
      throw new ValidationError('Password must contain at least one letter');

    if (!/[0-9]/.test(value))
      throw new ValidationError('Password must contain at least one number');

    return super.validate.call(this, value, {
      minLength: 8,
      maxLength: 128,
    }) as UserPasswordVo;
  }
}
