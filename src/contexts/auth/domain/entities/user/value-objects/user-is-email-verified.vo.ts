import { BooleanValueObject } from 'src/contexts/shared/domain';

export class UserIsEmailVerifiedVo extends BooleanValueObject {
  static default(): UserIsEmailVerifiedVo {
    return new UserIsEmailVerifiedVo(false);
  }
}
