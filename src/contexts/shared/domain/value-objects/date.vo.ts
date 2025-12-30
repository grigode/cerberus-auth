export class DateValueObject {
  constructor(readonly value: Date) {}

  static now<T extends DateValueObject>(this: new (value: Date) => T) {
    return new this(new Date(Date.now()));
  }

  static fromPersistence<T extends DateValueObject>(
    this: new (value: Date) => T,
    value: Date,
  ) {
    return new this(value);
  }
}
