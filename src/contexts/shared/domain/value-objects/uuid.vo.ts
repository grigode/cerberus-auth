import { v7 as uuidv7 } from 'uuid';

import { IdValueObject } from './id.vo';

export class UuidValueObject extends IdValueObject {
  constructor(value: string) {
    super(value);
  }

  static generate<T extends UuidValueObject>(
    this: new (value: string) => T,
  ): T {
    return new this(uuidv7());
  }
}
