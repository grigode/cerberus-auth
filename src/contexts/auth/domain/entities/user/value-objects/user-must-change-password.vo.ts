import { BooleanValueObject } from 'src/contexts/shared/domain';

export class UserMustChangePasswordVo extends BooleanValueObject {
  static default(): UserMustChangePasswordVo {
    return new UserMustChangePasswordVo(false);
  }
}
