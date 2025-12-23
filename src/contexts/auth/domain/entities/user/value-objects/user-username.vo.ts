import { StringValueObject, ValidationError } from 'src/contexts/shared/domain';

export class UserUsernameVo extends StringValueObject {
  private constructor(value: string) {
    super(value);
  }

  static create(value: string): UserUsernameVo {
    if (!/^[a-z0-9]+$/.test(value))
      throw new ValidationError(
        'Username must contain only lowercase letters and numbers, without spaces.',
      );

    return super._create.call(this, value, {
      minLength: 3,
      maxLength: 20,
    }) as UserUsernameVo;
  }
}
