import argon2 from 'argon2';
import { nanoid } from 'nanoid';
import { USER_DRIVEN_PORT_TOKEN, type UserDrivenPort } from '@core/domain';
import { Inject, type UseCase } from '@core/shared-server';

import type {
  GenerateMfaBackupCodesDto,
  MfaBackupCodesResult,
} from './generate-mfa-backup-codes.dto';
import {
  MfaNotEnabledException,
  UserNotFoundException,
} from '../../exceptions';

export class GenerateMfaBackupCodesUseCase
  implements UseCase<GenerateMfaBackupCodesDto, MfaBackupCodesResult>
{
  constructor(
    @Inject(USER_DRIVEN_PORT_TOKEN)
    private readonly userRepository: UserDrivenPort,
  ) {}

  async execute(dto: GenerateMfaBackupCodesDto): Promise<MfaBackupCodesResult> {
    const user = await this.userRepository.findById(dto.userId);
    if (!user) {
      throw new UserNotFoundException(dto.userId);
    }

    if (!user.data.isMfaEnabled) {
      throw new MfaNotEnabledException();
    }

    const plainCodes: string[] = [];
    const hashedCodes: string[] = [];

    for (let i = 0; i < 8; i++) {
      const code = nanoid(10).toUpperCase();
      plainCodes.push(code);
      const hashed = await argon2.hash(code);
      hashedCodes.push(hashed);
    }

    user.setBackupCodes(hashedCodes);
    await this.userRepository.update(user);

    return {
      backupCodes: plainCodes,
    };
  }
}
