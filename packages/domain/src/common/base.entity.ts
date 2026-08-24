export abstract class BaseEntity {
  private _changes: Map<string, unknown> = new Map();
  private _originalValues: Map<string, unknown> = new Map();

  protected trackChange<T>(field: string, newValue: T, oldValue: T): void {
    if (JSON.stringify(newValue) !== JSON.stringify(oldValue)) {
      this._changes.set(field, newValue);
    }
  }

  protected recordOriginalValue(field: string, value: unknown): void {
    if (!this._originalValues.has(field)) {
      this._originalValues.set(field, value);
    }
  }

  getChanges(): Record<string, unknown> {
    const changes: Record<string, unknown> = {};
    this._changes.forEach((value, key) => {
      changes[key] = value;
    });
    return changes;
  }

  hasChanges(): boolean {
    return this._changes.size > 0;
  }

  commitChanges(): void {
    this._originalValues.clear();
    this._changes.clear();
  }
}
