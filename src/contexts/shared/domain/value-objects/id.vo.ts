export class IdValueObject {
  constructor(readonly value: number) {}

  static fromPersistence<T extends IdValueObject>(
    this: new (value: number) => T,
    value: number,
  ): IdValueObject {
    return new this(value);
  }
}
