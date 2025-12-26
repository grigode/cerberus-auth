import { Inject } from '@nestjs/common';
import {
  LoginAttempt,
  LoginAttemptRepository,
} from 'src/contexts/security/domain';
import { Repository } from 'typeorm';

import { LoginAttemptDbEntity } from './login-attempt.db-entity';
import { LoginAttemptMapper } from './login-attempt.mapper';

export class TypeOrmLoginAttemptRepository implements LoginAttemptRepository {
  constructor(
    @Inject(LoginAttemptDbEntity)
    private readonly repo: Repository<LoginAttemptDbEntity>,
  ) {}

  async save(attempt: LoginAttempt): Promise<void> {
    const orm = LoginAttemptMapper.toOrm(attempt);
    await this.repo.save(orm);
  }
}
