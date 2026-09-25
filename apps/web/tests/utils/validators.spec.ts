import { describe, expect, it } from 'vitest';
import {
  createEmailValidation,
  createNameValidation,
  createPasswordValidation,
} from '../../app/utils/validators';

describe('Centralized Domain Validators', () => {
  const passwordMessages = {
    minLength: 'Min 12 chars',
    lowercase: 'Need lowercase',
    uppercase: 'Need uppercase',
    number: 'Need number',
    symbol: 'Need symbol',
  };

  const nameMessages = {
    required: 'Required',
    maxLength: 'Max 50',
  };

  describe('createPasswordValidation', () => {
    const schema = createPasswordValidation(passwordMessages);

    it('should validate strong passwords meeting all invariants', () => {
      expect(schema.safeParse('Password123!#').success).toBe(true);
      expect(schema.safeParse('A1b2C3d4E5f6!').success).toBe(true);
    });

    it('should reject short passwords (< 12 chars)', () => {
      const res = schema.safeParse('Pass123!');
      expect(res.success).toBe(false);
      if (!res.success) {
        expect(res.error.issues[0].message).toBe(passwordMessages.minLength);
      }
    });

    it('should reject passwords missing lowercase, uppercase, number or symbol', () => {
      expect(schema.safeParse('PASSWORD12345!').success).toBe(false);
      expect(schema.safeParse('password12345!').success).toBe(false);
      expect(schema.safeParse('PasswordPassword!').success).toBe(false);
      expect(schema.safeParse('Password1234567').success).toBe(false);
    });
  });

  describe('createEmailValidation', () => {
    const schema = createEmailValidation('Invalid email');

    it('should validate proper emails', () => {
      expect(schema.safeParse('user@example.com').success).toBe(true);
    });

    it('should reject malformed emails', () => {
      expect(schema.safeParse('not-an-email').success).toBe(false);
    });
  });

  describe('createNameValidation', () => {
    const schema = createNameValidation(nameMessages);

    it('should validate names between 1 and 50 chars', () => {
      expect(schema.safeParse('John').success).toBe(true);
      expect(schema.safeParse('A'.repeat(50)).success).toBe(true);
    });

    it('should reject empty names or names exceeding 50 chars', () => {
      expect(schema.safeParse('').success).toBe(false);
      expect(schema.safeParse('A'.repeat(51)).success).toBe(false);
    });
  });
});
