import type { PasswordResetToken } from './password-reset-token.entity';

export interface PasswordResetTokenDrivenPort {
  findByToken: (token: string) => Promise<PasswordResetToken | null>;
  verifyIfExistsByToken: (token: string) => Promise<boolean>;

  create: (
    passwordResetToken: PasswordResetToken,
  ) => Promise<PasswordResetToken>;

  update: (passwordResetToken: PasswordResetToken) => Promise<void>;
}
