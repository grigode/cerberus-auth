import { ValidationError } from 'src/contexts/shared/domain';

export class EmailValueObject {
  constructor(readonly value: string) {}

  static create(value: string): EmailValueObject {
    if (!value) throw new ValidationError('Email is required');

    const normalized = value.trim().toLowerCase();

    if (normalized.length > 255) throw new ValidationError('Email is too long');

    if (/\s/.test(normalized))
      throw new ValidationError('Email must not contain spaces');

    // Regex simple y suficiente para auth
    const emailRegex = /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/;

    if (!emailRegex.test(normalized))
      throw new ValidationError('Invalid email format');

    return new EmailValueObject(normalized);
  }

  static fromPersistence(value: string): EmailValueObject {
    return new EmailValueObject(value);
  }
}
