import { BufferValueObject } from 'src/contexts/shared/domain/value-objects/buffer.vo';

export class UserMfaAuthTagVo extends BufferValueObject {
  static create(value: Buffer): UserMfaAuthTagVo {
    return this._create.call(this, value, 16) as UserMfaAuthTagVo;
  }
}
