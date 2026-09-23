import { Injectable } from '@nestjs/common';
import argon2 from 'argon2';
import type { HashingDrivenPort } from '@core/domain';

@Injectable()
export class Argon2HashingAdapter implements HashingDrivenPort {
  async hash(plain: string): Promise<string> {
    return await argon2.hash(plain);
  }

  async compare(plain: string, hashed: string): Promise<boolean> {
    return await argon2.verify(hashed, plain);
  }
}
