export interface EncryptionDrivenPort {
  encrypt(plainText: string): string;
  decrypt(cipherText: string): string;
}
