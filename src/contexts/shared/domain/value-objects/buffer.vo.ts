import { ValidationError } from '../errors';

export class BufferValueObject {
  constructor(readonly value: Buffer) {}

  static validate<T extends BufferValueObject>(
    this: new (value: Buffer) => T,
    value: Buffer,
    maxLength: number,
  ): BufferValueObject {
    if (value.length > maxLength)
      throw new ValidationError('Invalid Buffer length');
    return new this(value);
  }

  static fromPersistence<T extends BufferValueObject>(
    this: new (value: Buffer) => T,
    value: Buffer,
  ): BufferValueObject {
    return new this(value);
  }
}
