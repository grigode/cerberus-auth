import { Injectable } from '@nestjs/common';
import type { User, UserDrivenPort } from '@core/domain';
import { Inject } from '@core/shared-server';
import type { UuidVo } from '@core/domain';
import { MAIN_DATA_SOURCE } from '@core/database';
import type { DataSource, Repository } from 'typeorm';

import { UserMapper } from '../../mappers';
import { UserEntity } from '@core/database';

@Injectable()
export class UserDrivenTypeormAdapter implements UserDrivenPort {
  private readonly repository: Repository<UserEntity>;
  private mapper = new UserMapper();

  constructor(@Inject(MAIN_DATA_SOURCE) dataSource: DataSource) {
    this.repository = dataSource.getRepository(UserEntity);
  }

  verifyIfExistsByEmail(email: string): Promise<boolean> {
    return this.repository.existsBy({ email });
  }

  async findById(id: UuidVo): Promise<User | null> {
    const user = await this.repository.findOne({
      where: { id },
      relations: { providers: true, role: true },
    });

    return user ? this.mapper.infrastructureToDomain(user) : null;
  }

  async findByEmail(email: string): Promise<User | null> {
    const user = await this.repository.findOne({
      where: { email },
      relations: { providers: true, role: true },
    });

    return user ? this.mapper.infrastructureToDomain(user) : null;
  }

  async create(user: User): Promise<User> {
    const userEntity = this.mapper.domainToInfrastructure(user);
    const newUser = await this.repository.save(userEntity);
    return this.mapper.infrastructureToDomain(newUser);
  }

  async update(user: User): Promise<void> {
    if (!user.hasChanges()) return;

    const changes = user.getChanges();
    const userId = user.data.id;

    const dbChanges: Record<string, unknown> = {};
    if ('hashedPassword' in changes) {
      dbChanges.password = changes.hashedPassword;
    }
    if ('isActive' in changes) {
      dbChanges.isActive = changes.isActive;
    }
    if ('isEmailVerified' in changes) {
      dbChanges.isEmailVerified = changes.isEmailVerified;
    }
    if ('updatedAt' in changes) {
      dbChanges.updatedAt = changes.updatedAt;
    }
    if ('lastLoginAt' in changes) {
      dbChanges.lastLoginAt = changes.lastLoginAt;
    }
    if ('role' in changes) {
      const roleMapInfrastructure: Record<string, number> = {
        superadmin: 1,
        admin: 2,
        staff: 3,
        user: 4,
      } as const;
      dbChanges.role = { id: roleMapInfrastructure[String(changes.role)] };
    }

    if (Object.keys(dbChanges).length > 0) {
      await this.repository.update(userId.toString(), dbChanges);
    }

    if ('providers' in changes) {
      const userEntity = this.mapper.domainToInfrastructure(user);
      const dbUser = await this.repository.findOne({
        where: { id: userId.toString() },
        relations: { providers: true },
      });
      if (dbUser) {
        dbUser.providers = userEntity.providers;
        await this.repository.save(dbUser);
      }
    }

    user.commitChanges();
  }
}
