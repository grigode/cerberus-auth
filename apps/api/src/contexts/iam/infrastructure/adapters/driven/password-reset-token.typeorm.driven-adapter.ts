import * as crypto from 'node:crypto';
import { Injectable } from '@nestjs/common';
import type {
  PasswordResetToken,
  PasswordResetTokenDrivenPort,
} from '@core/domain';
import { Inject } from '@core/shared-server';
import { MAIN_DATA_SOURCE } from '@core/database';
import type { DataSource, Repository } from 'typeorm';

import { PasswordResetTokenMapper } from '../../mappers';
import { PasswordResetTokenEntity } from '@core/database';

@Injectable()
export class PasswordResetTokenTypeormAdapter
  implements PasswordResetTokenDrivenPort
{
  private readonly passwordResetTokenRepository: Repository<PasswordResetTokenEntity>;
  private mapper = new PasswordResetTokenMapper();

  constructor(@Inject(MAIN_DATA_SOURCE) dataSource: DataSource) {
    this.passwordResetTokenRepository = dataSource.getRepository(
      PasswordResetTokenEntity,
    );
  }

  verifyIfExistsByToken(token: string): Promise<boolean> {
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
    return this.passwordResetTokenRepository.existsBy([
      { token: hashedToken },
      { token },
    ]);
  }

  async findByToken(token: string): Promise<PasswordResetToken | null> {
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
    const passwordResetToken = await this.passwordResetTokenRepository.findOne({
      where: [{ token: hashedToken }, { token }],
      relations: { user: true },
    });
    return passwordResetToken
      ? this.mapper.infrastructureToDomain(passwordResetToken)
      : null;
  }

  async create(
    passwordResetToken: PasswordResetToken,
  ): Promise<PasswordResetToken> {
    const passwordResetTokenEntity =
      this.mapper.domainToInfrastructure(passwordResetToken);
    passwordResetTokenEntity.token = crypto
      .createHash('sha256')
      .update(passwordResetToken.data.token)
      .digest('hex');
    await this.passwordResetTokenRepository.save(passwordResetTokenEntity);
    return passwordResetToken;
  }

  async update(passwordResetToken: PasswordResetToken): Promise<void> {
    if (!passwordResetToken.hasChanges()) return;

    const changes = passwordResetToken.getChanges();
    const passwordResetTokenId = passwordResetToken.data.id;

    await this.passwordResetTokenRepository.update(
      passwordResetTokenId.toString(),
      changes,
    );
    passwordResetToken.commitChanges();
  }
}
