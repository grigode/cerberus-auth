export interface HasherPort {
  hashPassword(plain: string): Promise<string>;
  verifyPassword(plain: string, hashed: string): Promise<boolean>;
}
