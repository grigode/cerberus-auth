export class BooleanValueObject {
  constructor(readonly value: boolean) {}

  static create<T extends BooleanValueObject>(
    this: new (value: boolean) => T,
    value: boolean,
  ): BooleanValueObject {
    return new this(value);
  }

  static fromPersistence<T extends BooleanValueObject>(
    this: new (value: boolean) => T,
    value: boolean,
  ): BooleanValueObject {
    return new this(value);
  }
}
