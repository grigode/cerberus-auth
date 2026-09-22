import * as speakeasy from 'speakeasy';
import { USER_DRIVEN_PORT_TOKEN, type UserDrivenPort } from '@core/domain';
import { Inject, type UseCase } from '@core/shared-server';
import {
  ENCRYPTION_DRIVEN_PORT_TOKEN,
  type EncryptionDrivenPort,
} from '@core/domain';

import type { EnableMfaDto } from './enable-mfa.dto';
import {
  InvalidMfaCodeException,
  MfaAlreadyEnabledException,
  UserNotFoundException,
} from '../../exceptions';

export class EnableMfaUseCase implements UseCase<EnableMfaDto, void> {
  constructor(
    @Inject(USER_DRIVEN_PORT_TOKEN)
    private readonly userRepository: UserDrivenPort,
    @Inject(ENCRYPTION_DRIVEN_PORT_TOKEN)
    private readonly encryptionPort: EncryptionDrivenPort,
  ) {}

  async execute(dto: EnableMfaDto): Promise<void> {
    const user = await this.userRepository.findById(dto.userId);
    if (!user) throw new UserNotFoundException(dto.userId);

    if (user.data.isMfaEnabled) {
      throw new MfaAlreadyEnabledException();
    }

    const verified = speakeasy.totp.verify({
      secret: dto.secret,
      encoding: 'base32',
      token: dto.code,
      window: 1,
    });

    if (!verified) {
      throw new InvalidMfaCodeException();
    }

    const encryptedSecret = this.encryptionPort.encrypt(dto.secret);
    user.enableMfa(encryptedSecret);
    await this.userRepository.update(user);
  }
}
