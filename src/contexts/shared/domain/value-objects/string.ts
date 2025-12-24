import { ValidationError } from '../errors';

export interface StringValueObjectValidationOptions {
  minLength: number;
  maxLength: number;
}

export class StringValueObject {
  constructor(readonly value: string) {}

  static _create<T extends StringValueObject>(
    this: new (value: string) => T,
    value: string,
    options: { minLength: number; maxLength: number } = {
      minLength: 0,
      maxLength: 255,
    },
  ): T {
    if (value.length < options.minLength) {
      throw new ValidationError(
        `String must have at least ${options.minLength} chars`,
      );
    }

    if (value.length > options.maxLength) {
      throw new ValidationError(
        `String must have at most ${options.maxLength} chars`,
      );
    }

    return new this(value);
  }

  static fromPersistence<T extends StringValueObject>(
    this: new (value: string) => T,
    value: string,
  ): T {
    return new this(value);
  }
}
