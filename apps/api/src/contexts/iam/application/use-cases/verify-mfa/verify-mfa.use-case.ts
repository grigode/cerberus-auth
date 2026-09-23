import * as speakeasy from 'speakeasy';
import { USER_DRIVEN_PORT_TOKEN, type UserDrivenPort } from '@core/domain';
import { Inject, type UseCase } from '@core/shared-server';
import {
  ACCESS_TOKEN_DRIVEN_PORT_TOKEN,
  ENCRYPTION_DRIVEN_PORT_TOKEN,
  type AccessTokenDrivenPort,
  type EncryptionDrivenPort,
} from '@core/domain';

import type { VerifyMfaDto } from './verify-mfa.dto';
import {
  InvalidMfaCodeException,
  MfaNotEnabledException,
  UserInactiveException,
  UserNotFoundException,
} from '../../exceptions';
import type { CreateSessionUseCase, Session } from '../create-session';

export class VerifyMfaUseCase implements UseCase<VerifyMfaDto, Session> {
  constructor(
    @Inject(USER_DRIVEN_PORT_TOKEN)
    private readonly userRepository: UserDrivenPort,
    @Inject(ACCESS_TOKEN_DRIVEN_PORT_TOKEN)
    private readonly accessTokenService: AccessTokenDrivenPort,
    @Inject(ENCRYPTION_DRIVEN_PORT_TOKEN)
    private readonly encryptionPort: EncryptionDrivenPort,
    private readonly createSessionUseCase: CreateSessionUseCase,
  ) {}

  async execute(dto: VerifyMfaDto): Promise<Session> {
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

    if (!user.data.isMfaEnabled || !user.data.mfaSecret) {
      throw new MfaNotEnabledException();
    }

    const plainSecret = this.encryptionPort.decrypt(user.data.mfaSecret);

    const verified = speakeasy.totp.verify({
      secret: plainSecret,
      encoding: 'base32',
      token: dto.code,
      window: 1,
    });

    if (!verified) {
      user.incrementFailedLogin();
      await this.userRepository.update(user);
      throw new InvalidMfaCodeException();
    }

    user.resetFailedLogin();
    user.updateLastLoginAt();
    await this.userRepository.update(user);

    return await this.createSessionUseCase.execute({ user });
  }
}
