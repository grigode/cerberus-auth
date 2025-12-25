export abstract class IdValueObject {
  readonly value: string;

  protected constructor(value: string) {
    this.value = value;
  }

  equals(other: IdValueObject): boolean {
    return this.value === other.value;
  }
}
