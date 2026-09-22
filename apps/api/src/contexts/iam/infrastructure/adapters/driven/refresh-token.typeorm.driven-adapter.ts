import { Injectable } from '@nestjs/common';
import type { RefreshToken, RefreshTokenDrivenPort } from '@core/domain';
import { Inject } from '@core/shared-server';
import { MAIN_DATA_SOURCE } from '@core/database';
import { type DataSource, IsNull, MoreThan, type Repository } from 'typeorm';

import { RefreshTokenMapper } from '../../mappers';
import { RefreshTokenEntity } from '@core/database';

@Injectable()
export class RefreshTokenTypeormAdapter implements RefreshTokenDrivenPort {
  private readonly refreshTokenRepository: Repository<RefreshTokenEntity>;
  private mapper = new RefreshTokenMapper();

  constructor(@Inject(MAIN_DATA_SOURCE) dataSource: DataSource) {
    this.refreshTokenRepository = dataSource.getRepository(RefreshTokenEntity);
  }

  async findById(id: string): Promise<RefreshToken | null> {
    const refreshToken = await this.refreshTokenRepository.findOne({
      where: { id },
      relations: { user: true },
    });
    return refreshToken
      ? this.mapper.infrastructureToDomain(refreshToken)
      : null;
  }

  async findByToken(token: string): Promise<RefreshToken | null> {
    const refreshToken = await this.refreshTokenRepository.findOne({
      where: { token },
      relations: { user: true },
    });
    return refreshToken
      ? this.mapper.infrastructureToDomain(refreshToken)
      : null;
  }

  async create(refreshToken: RefreshToken): Promise<RefreshToken> {
    const refreshTokenEntity = this.mapper.domainToInfrastructure(refreshToken);
    const newRefreshTokenEntity =
      await this.refreshTokenRepository.save(refreshTokenEntity);
    return this.mapper.infrastructureToDomain(newRefreshTokenEntity);
  }

  async update(refreshToken: RefreshToken): Promise<void> {
    if (!refreshToken.hasChanges()) return;

    const changes = refreshToken.getChanges();
    const refreshTokenId = refreshToken.data.id;

    const dbChanges: Record<string, unknown> = {};
    if ('revokedAt' in changes) {
      dbChanges.revokedAt = changes.revokedAt;
    }
    if ('lastUsedAt' in changes) {
      dbChanges.lastUsedAt = changes.lastUsedAt;
    }

    if (Object.keys(dbChanges).length > 0) {
      await this.refreshTokenRepository.update(
        refreshTokenId.toString(),
        dbChanges,
      );
    }

    refreshToken.commitChanges();
  }

  async revokeById(id: string): Promise<void> {
    await this.refreshTokenRepository.update(
      { id, revokedAt: IsNull() },
      { revokedAt: new Date() },
    );
  }

  async revokeAllByUserId(userId: string): Promise<void> {
    await this.refreshTokenRepository.update(
      { user: { id: userId }, revokedAt: IsNull() },
      { revokedAt: new Date() },
    );
  }

  async findAllActiveByUserId(userId: string): Promise<RefreshToken[]> {
    const tokens = await this.refreshTokenRepository.find({
      where: {
        user: { id: userId },
        revokedAt: IsNull(),
        expiresAt: MoreThan(new Date()),
      },
      relations: { user: true },
    });

    return tokens.map((token) => this.mapper.infrastructureToDomain(token));
  }
}
