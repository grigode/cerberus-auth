import { BufferValueObject } from 'src/contexts/shared/domain/value-objects/buffer.vo';

export class UserMfaSecretCiphertextVo extends BufferValueObject {
  static create(value: Buffer): UserMfaSecretCiphertextVo {
    return this.validate.call(this, value, 255) as UserMfaSecretCiphertextVo;
  }
}
