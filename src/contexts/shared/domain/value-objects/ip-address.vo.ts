import { StringValueObject } from 'src/contexts/shared/domain';

export class IpAddressValueObject extends StringValueObject {
  static create(value: string): IpAddressValueObject {
    return this._create.call(this, value, {
      minLength: 1,
      maxLength: 64,
    }) as IpAddressValueObject;
  }
}
