import { Inject } from '@nestjs/common';
import {
  SecurityEvent,
  SecurityEventRepository,
} from 'src/contexts/security/domain';
import { LoginAttemptDbEntity } from '../login-attempt';
import { Repository } from 'typeorm';
import { SecurityEventMapper } from './security-event.mapper';

export class TypeOrmSecurityEventRepository implements SecurityEventRepository {
  constructor(
    @Inject(LoginAttemptDbEntity)
    private readonly repo: Repository<LoginAttemptDbEntity>,
  ) {}

  async save(securityEvent: SecurityEvent): Promise<void> {
    const orm = SecurityEventMapper.toOrm(securityEvent);
    await this.repo.save(orm);
  }
}
