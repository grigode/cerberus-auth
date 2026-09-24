import {
  USER_DRIVEN_PORT_TOKEN,
  ACCESS_TOKEN_DRIVEN_PORT_TOKEN,
  HASHING_DRIVEN_PORT_TOKEN,
  type UserDrivenPort,
  type AccessTokenDrivenPort,
  type HashingDrivenPort,
} from '@core/domain';
import { Inject, type UseCase } from '@core/shared-server';

import type { VerifyMfaBackupCodeDto } from './verify-mfa-backup-code.dto';
import {
  InvalidMfaCodeException,
  MfaNotEnabledException,
  UserInactiveException,
  UserNotFoundException,
} from '../../exceptions';
import { CreateSessionUseCase, Session } from '../create-session';

export class VerifyMfaBackupCodeUseCase
  implements UseCase<VerifyMfaBackupCodeDto, Session>
{
  constructor(
    @Inject(USER_DRIVEN_PORT_TOKEN)
    private readonly userRepository: UserDrivenPort,
    @Inject(ACCESS_TOKEN_DRIVEN_PORT_TOKEN)
    private readonly accessTokenService: AccessTokenDrivenPort,
    @Inject(HASHING_DRIVEN_PORT_TOKEN)
    private readonly hashingPort: HashingDrivenPort,
    private readonly createSessionUseCase: CreateSessionUseCase,
  ) {}

  async execute(dto: VerifyMfaBackupCodeDto): Promise<Session> {
    let payload: { sub: string; mfaPending?: boolean } | null = null;
    try {
      payload = await this.accessTokenService.validateAccessToken<{
        sub: string;
        mfaPending?: boolean;
      }>(dto.mfaToken);
    } catch {
      throw new InvalidMfaCodeException();
    }

    if (!payload?.sub || !payload.mfaPending) {
      throw new InvalidMfaCodeException();
    }

    const user = await this.userRepository.findById(payload.sub);
    if (!user) throw new UserNotFoundException(payload.sub);
    if (!user.data.isActive) throw new UserInactiveException(user.data.email);

    if (user.isLockedOut()) {
      throw new InvalidMfaCodeException(
        'Account locked due to consecutive failed attempts. Please try again later.',
      );
    }

    if (!user.data.isMfaEnabled) {
      throw new MfaNotEnabledException();
    }

    const backupCodes = user.data.mfaBackupCodes;
    let matchingIndex = -1;

    for (let i = 0; i < backupCodes.length; i++) {
      const match = await this.hashingPort.compare(dto.code, backupCodes[i]);
      if (match) {
        matchingIndex = i;
        break;
      }
    }

    if (matchingIndex === -1) {
      user.incrementFailedLogin();
      await this.userRepository.update(user);
      throw new InvalidMfaCodeException();
    }

    user.consumeBackupCode(matchingIndex);
    user.resetFailedLogin();
    user.updateLastLoginAt();
    await this.userRepository.update(user);

    return await this.createSessionUseCase.execute({
      user,
      userAgent: dto.userAgent,
      ipAddress: dto.ipAddress,
    });
  }
}
