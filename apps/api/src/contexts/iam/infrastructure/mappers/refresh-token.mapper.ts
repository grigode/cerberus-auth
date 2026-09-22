import type { Mapper } from '@core/shared-server';

import { RefreshToken } from '@core/domain';
import { RefreshTokenEntity, UserEntity } from '@core/database';

export class RefreshTokenMapper
  implements Mapper<RefreshToken, RefreshTokenEntity>
{
  domainToInfrastructure(entity: RefreshToken): RefreshTokenEntity {
    const data = entity.data;

    const userRef = new UserEntity();
    userRef.id = data.userId;

    const entityMapped = new RefreshTokenEntity();
    entityMapped.id = data.id;
    entityMapped.user = userRef;
    entityMapped.token = data.token;
    entityMapped.createdAt = data.createdAt;
    entityMapped.expiresAt = data.expiresAt;
    entityMapped.revokedAt = data.revokedAt;
    entityMapped.userAgent = data.userAgent;
    entityMapped.ipAddress = data.ipAddress;
    entityMapped.lastUsedAt = data.lastUsedAt;

    return entityMapped;
  }

  infrastructureToDomain(entity: RefreshTokenEntity): RefreshToken {
    return new RefreshToken({
      id: entity.id,
      userId: entity.user.id,
      token: entity.token,
      createdAt: entity.createdAt,
      expiresAt: entity.expiresAt,
      revokedAt: entity.revokedAt,
      userAgent: entity.userAgent,
      ipAddress: entity.ipAddress,
      lastUsedAt: entity.lastUsedAt,
    });
  }
}
