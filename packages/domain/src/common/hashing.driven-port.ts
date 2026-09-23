export interface HashingDrivenPort {
  hash(plain: string): Promise<string>;
  compare(plain: string, hashed: string): Promise<boolean>;
}

export const HASHING_DRIVEN_PORT_TOKEN = Symbol('HASHING_DRIVEN_PORT_TOKEN');
