import { StringValueObject } from 'src/contexts/shared/domain';

export class UserDeviceIpAddressVo extends StringValueObject {
  static create(value: string): UserDeviceIpAddressVo {
    return this.validate.call(this, value, {
      minLength: 1,
      maxLength: 64,
    }) as UserDeviceIpAddressVo;
  }
}
