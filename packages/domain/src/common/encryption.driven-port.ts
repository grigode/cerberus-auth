export interface EncryptionDrivenPort {
  encrypt(plainText: string): string;
  decrypt(cipherText: string): string;
}

export const ENCRYPTION_DRIVEN_PORT_TOKEN = Symbol(
  'ENCRYPTION_DRIVEN_PORT_TOKEN',
);
