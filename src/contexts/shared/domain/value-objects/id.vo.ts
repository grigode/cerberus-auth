export abstract class IdValueObject {
  constructor(readonly value: string) {}

  static create<T extends IdValueObject>(
    this: new (value: string) => T,
    value: string,
  ): T {
    return new this(value);
  }

  static fromPersistence<T extends IdValueObject>(
    this: new (value: string) => T,
    value: string,
  ): T {
    return new this(value);
  }

  equals(other: IdValueObject): boolean {
    return this.value === other.value;
  }
}
