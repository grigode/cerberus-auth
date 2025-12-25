import { BufferValueObject } from 'src/contexts/shared/domain/value-objects/buffer.vo';

export class UserMfaIvVo extends BufferValueObject {
  static create(value: Buffer): UserMfaIvVo {
    return this._create.call(this, value, 12) as UserMfaIvVo;
  }
}
