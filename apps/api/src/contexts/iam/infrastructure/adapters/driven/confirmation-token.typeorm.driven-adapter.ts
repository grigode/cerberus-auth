import * as crypto from 'node:crypto';
import { Injectable } from '@nestjs/common';
import type {
  ConfirmationToken,
  ConfirmationTokenDrivenPort,
} from '@core/domain';
import { Inject } from '@core/shared-server';
import { MAIN_DATA_SOURCE } from '@core/database';
import type { DataSource, Repository } from 'typeorm';

import { ConfirmationTokenMapper } from '../../mappers';
import { ConfirmationTokenEntity } from '@core/database';

@Injectable()
export class ConfirmationTokenTypeormAdapter
  implements ConfirmationTokenDrivenPort
{
  private readonly confirmationTokenRepository: Repository<ConfirmationTokenEntity>;
  private mapper = new ConfirmationTokenMapper();

  constructor(@Inject(MAIN_DATA_SOURCE) dataSource: DataSource) {
    this.confirmationTokenRepository = dataSource.getRepository(
      ConfirmationTokenEntity,
    );
  }

  verifyIfExistsByToken(token: string): Promise<boolean> {
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
    return this.confirmationTokenRepository.existsBy([
      { token: hashedToken },
      { token },
    ]);
  }

  async findByToken(token: string): Promise<ConfirmationToken | null> {
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
    const confirmationToken = await this.confirmationTokenRepository.findOne({
      where: [{ token: hashedToken }, { token }],
      relations: { user: true },
    });
    return confirmationToken
      ? this.mapper.infrastructureToDomain(confirmationToken)
      : null;
  }

  async create(
    confirmationToken: ConfirmationToken,
  ): Promise<ConfirmationToken> {
    const confirmationTokenEntity =
      this.mapper.domainToInfrastructure(confirmationToken);
    confirmationTokenEntity.token = crypto
      .createHash('sha256')
      .update(confirmationToken.data.token)
      .digest('hex');
    await this.confirmationTokenRepository.save(confirmationTokenEntity);
    return confirmationToken;
  }

  async update(confirmationToken: ConfirmationToken): Promise<void> {
    if (!confirmationToken.hasChanges()) return;

    const changes = confirmationToken.getChanges();
    const confirmationTokenId = confirmationToken.data.id;

    await this.confirmationTokenRepository.update(
      confirmationTokenId.toString(),
      changes,
    );
    confirmationToken.commitChanges();
  }
}
