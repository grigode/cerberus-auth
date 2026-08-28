import * as crypto from 'node:crypto';
import { Injectable } from '@nestjs/common';
import type { SecurityConfigService } from '@core/config';
import type { EncryptionDrivenPort } from '@core/domain';

@Injectable()
export class CryptoDrivenAdapter implements EncryptionDrivenPort {
  private readonly algorithm = 'aes-256-gcm';
  private readonly key: Buffer;

  constructor(private readonly securityConfig: SecurityConfigService) {
    const secret = this.securityConfig.ENCRYPTION_KEY;
    this.key = crypto.createHash('sha256').update(secret).digest();
  }

  encrypt(plainText: string): string {
    const iv = crypto.randomBytes(12); // 12-byte IV for GCM
    const cipher = crypto.createCipheriv(this.algorithm, this.key, iv);

    let encrypted = cipher.update(plainText, 'utf8', 'hex');
    encrypted += cipher.final('hex');

    const authTagHex = cipher.getAuthTag().toString('hex');
    const ivHex = iv.toString('hex');

    // Format: ivHex:authTagHex:encryptedDataHex
    return `${ivHex}:${authTagHex}:${encrypted}`;
  }

  decrypt(cipherText: string): string {
    const parts = cipherText.split(':');
    if (parts.length !== 3) {
      throw new Error('Invalid encrypted format');
    }

    const [ivHex, authTagHex, encryptedDataHex] = parts;
    const iv = Buffer.from(ivHex, 'hex');
    const authTag = Buffer.from(authTagHex, 'hex');

    const decipher = crypto.createDecipheriv(this.algorithm, this.key, iv);
    decipher.setAuthTag(authTag);

    let decrypted = decipher.update(encryptedDataHex, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    return decrypted;
  }
}
