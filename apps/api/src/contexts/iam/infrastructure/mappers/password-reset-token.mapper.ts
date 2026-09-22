import { PasswordResetToken } from '@core/domain';
import type { Mapper } from '@core/shared-server';

import { PasswordResetTokenEntity, UserEntity } from '@core/database';

export class PasswordResetTokenMapper
  implements Mapper<PasswordResetToken, PasswordResetTokenEntity>
{
  domainToInfrastructure(entity: PasswordResetToken): PasswordResetTokenEntity {
    const data = entity.data;

    const userRef = new UserEntity();
    userRef.id = data.userId;

    const entityMapped = new PasswordResetTokenEntity();
    entityMapped.id = data.id;
    entityMapped.user = userRef;
    entityMapped.token = data.token;
    entityMapped.createdAt = data.createdAt;
    entityMapped.expiresAt = data.expiresAt;
    entityMapped.usedAt = data.usedAt;

    return entityMapped;
  }

  infrastructureToDomain(entity: PasswordResetTokenEntity): PasswordResetToken {
    return new PasswordResetToken({
      id: entity.id,
      userId: entity.user.id,
      token: entity.token,
      createdAt: entity.createdAt,
      expiresAt: entity.expiresAt,
      usedAt: entity.usedAt,
    });
  }
}
