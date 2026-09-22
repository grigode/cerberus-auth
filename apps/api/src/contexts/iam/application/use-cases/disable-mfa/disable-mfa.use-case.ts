import * as speakeasy from 'speakeasy';
import { USER_DRIVEN_PORT_TOKEN, type UserDrivenPort } from '@core/domain';
import { Inject, type UseCase } from '@core/shared-server';
import {
  ENCRYPTION_DRIVEN_PORT_TOKEN,
  type EncryptionDrivenPort,
} from '@core/domain';

import type { DisableMfaDto } from './disable-mfa.dto';
import {
  InvalidMfaCodeException,
  MfaNotEnabledException,
  UserNotFoundException,
} from '../../exceptions';

export class DisableMfaUseCase implements UseCase<DisableMfaDto, void> {
  constructor(
    @Inject(USER_DRIVEN_PORT_TOKEN)
    private readonly userRepository: UserDrivenPort,
    @Inject(ENCRYPTION_DRIVEN_PORT_TOKEN)
    private readonly encryptionPort: EncryptionDrivenPort,
  ) {}

  async execute(dto: DisableMfaDto): Promise<void> {
    const user = await this.userRepository.findById(dto.userId);
    if (!user) throw new UserNotFoundException(dto.userId);

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
      throw new InvalidMfaCodeException();
    }

    user.disableMfa();
    await this.userRepository.update(user);
  }
}
