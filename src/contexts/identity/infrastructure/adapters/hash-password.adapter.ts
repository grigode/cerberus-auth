import argon2 from 'argon2';

export class HashPasswordAdapter {
  static hash(plain: string): Promise<string> {
    return argon2.hash(plain);
  }
}
