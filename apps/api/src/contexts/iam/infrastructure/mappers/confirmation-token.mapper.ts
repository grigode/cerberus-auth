import { ConfirmationToken } from '@core/domain';
import type { Mapper } from '@core/shared-server';

import { ConfirmationTokenEntity, UserEntity } from '@core/database';

export class ConfirmationTokenMapper
  implements Mapper<ConfirmationToken, ConfirmationTokenEntity>
{
  domainToInfrastructure(entity: ConfirmationToken): ConfirmationTokenEntity {
    const data = entity.data;

    const userRef = new UserEntity();
    userRef.id = data.userId;

    const entityMapped = new ConfirmationTokenEntity();
    entityMapped.id = data.id;
    entityMapped.user = userRef;
    entityMapped.token = data.token;
    entityMapped.createdAt = data.createdAt;
    entityMapped.expiresAt = data.expiresAt;
    entityMapped.usedAt = data.usedAt;

    return entityMapped;
  }

  infrastructureToDomain(entity: ConfirmationTokenEntity): ConfirmationToken {
    return new ConfirmationToken({
      id: entity.id,
      userId: entity.user.id,
      token: entity.token,
      createdAt: entity.createdAt,
      expiresAt: entity.expiresAt,
      usedAt: entity.usedAt,
    });
  }
}
