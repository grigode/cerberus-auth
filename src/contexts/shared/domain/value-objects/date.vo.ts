export class DateValueObject {
  protected constructor(readonly value: Date) {}

  static fromPersistence<T extends DateValueObject>(
    this: new (value: Date) => T,
    value: string,
  ) {
    return new this(new Date(value));
  }
}
