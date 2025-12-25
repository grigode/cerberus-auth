import { StringValueObject } from 'src/contexts/shared/domain';

export class SecurityEventTypeVo extends StringValueObject {
  static create(value: string): SecurityEventTypeVo {
    return this._create.call(this, value, {
      minLength: 1,
      maxLength: 20,
    }) as SecurityEventTypeVo;
  }
}
