import * as z from 'zod';

export interface PasswordValidationMessages {
  minLength: string;
  lowercase: string;
  uppercase: string;
  number: string;
  symbol: string;
}

export interface NameValidationMessages {
  required: string;
  maxLength: string;
}

/**
 * Single source of truth for password complexity requirements matching backend DDD rules:
 * - Minimum 12 characters
 * - At least one lowercase letter
 * - At least one uppercase letter
 * - At least one number
 * - At least one special symbol
 */
export const createPasswordValidation = (
  messages: PasswordValidationMessages,
) => {
  return z
    .string(messages.minLength)
    .min(12, messages.minLength)
    .regex(/[a-z]/, messages.lowercase)
    .regex(/[A-Z]/, messages.uppercase)
    .regex(/[0-9]/, messages.number)
    .regex(/[^A-Za-z0-9]/, messages.symbol);
};

/**
 * Standard email validator
 */
export const createEmailValidation = (errorMessage: string) => {
  return z.email(errorMessage);
};

/**
 * Standard name validator (1 to 50 characters) matching backend RegisterUserDto
 */
export const createNameValidation = (messages: NameValidationMessages) => {
  return z
    .string(messages.required)
    .min(1, messages.required)
    .max(50, messages.maxLength);
};
