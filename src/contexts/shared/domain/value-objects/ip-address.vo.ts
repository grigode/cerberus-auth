import { StringValueObject } from 'src/contexts/shared/domain';

export class IpAddressValueObject extends StringValueObject {
  static create(value: string): IpAddressValueObject {
    return this.validate.call(this, value, {
      minLength: 1,
      maxLength: 64,
    }) as IpAddressValueObject;
  }
}
