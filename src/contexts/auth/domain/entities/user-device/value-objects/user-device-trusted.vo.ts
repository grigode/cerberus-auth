import { BooleanValueObject } from 'src/contexts/shared/domain';

export class UserDeviceTrustedVo extends BooleanValueObject {
  static default() {
    return new UserDeviceTrustedVo(false);
  }
}
