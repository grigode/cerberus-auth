import { BooleanValueObject } from 'src/contexts/shared/domain';

export class UserIsActiveVo extends BooleanValueObject {
  static default(): UserIsActiveVo {
    return new UserIsActiveVo(true);
  }
}
