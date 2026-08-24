import type { ConfirmationToken } from './confirmation-token.entity';

export interface ConfirmationTokenDrivenPort {
  findByToken: (token: string) => Promise<ConfirmationToken | null>;
  verifyIfExistsByToken: (token: string) => Promise<boolean>;

  create: (confirmationToken: ConfirmationToken) => Promise<ConfirmationToken>;

  update: (confirmationToken: ConfirmationToken) => Promise<void>;
}
