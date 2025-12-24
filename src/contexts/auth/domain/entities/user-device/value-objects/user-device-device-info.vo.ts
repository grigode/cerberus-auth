import { StringValueObject } from 'src/contexts/shared/domain';

export class UserDeviceDeviceInfoVo extends StringValueObject {
  static create(value: string): UserDeviceDeviceInfoVo {
    return new UserDeviceDeviceInfoVo(value);
  }
}
