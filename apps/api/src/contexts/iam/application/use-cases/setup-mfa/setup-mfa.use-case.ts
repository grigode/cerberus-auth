import * as qrcode from 'qrcode';
import * as speakeasy from 'speakeasy';
import { USER_DRIVEN_PORT_TOKEN, type UserDrivenPort } from '@core/domain';
import { Inject, type UseCase } from '@core/shared-server';

import type { SetupMfaDto, SetupMfaResponse } from './setup-mfa.dto';
import {
  MfaAlreadyEnabledException,
  UserNotFoundException,
} from '../../exceptions';

export class SetupMfaUseCase implements UseCase<SetupMfaDto, SetupMfaResponse> {
  constructor(
    @Inject(USER_DRIVEN_PORT_TOKEN)
    private readonly userRepository: UserDrivenPort,
  ) {}

  async execute(dto: SetupMfaDto): Promise<SetupMfaResponse> {
    const user = await this.userRepository.findById(dto.userId);
    if (!user) throw new UserNotFoundException(dto.userId);

    if (user.data.isMfaEnabled) {
      throw new MfaAlreadyEnabledException();
    }

    const appName = dto.appName || 'App';
    const secret = speakeasy.generateSecret({
      name: `${appName} (${user.data.email})`,
      length: 20,
    });

    const qrCodeUrl = await qrcode.toDataURL(secret.otpauth_url || '');

    return {
      secret: secret.base32,
      qrCodeUrl,
    };
  }
}
