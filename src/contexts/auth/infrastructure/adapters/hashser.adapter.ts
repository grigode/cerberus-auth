import argon2 from 'argon2';

import { HasherPort } from '../../domain';

export class HasherAdapter implements HasherPort {
  hashPassword(plain: string): Promise<string> {
    return argon2.hash(plain);
  }

  verifyPassword(plain: string, hashed: string): Promise<boolean> {
    return argon2.verify(hashed, plain);
  }
}
