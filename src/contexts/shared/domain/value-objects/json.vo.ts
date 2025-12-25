export type JSONT = Record<string, string | number | boolean>;

export class JsonValueObject {
  constructor(readonly value: JSONT) {}

  static create<T extends JsonValueObject>(
    this: new (value: JSONT) => T,
    value: JSONT,
  ): JsonValueObject {
    return new this(value);
  }

  static fromPersistence<T extends JsonValueObject>(
    this: new (value: JSONT) => T,
    value: string,
  ): JsonValueObject {
    return new this(JSON.parse(value) as JSONT);
  }

  toPersistence(): string {
    return JSON.stringify(this.value);
  }
}
