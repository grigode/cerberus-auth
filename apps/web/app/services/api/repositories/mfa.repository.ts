import type {
  GenerateBackupCodesResponseDto,
  MfaDisableRequestDto,
  MfaDisableResponseDto,
  MfaEnableRequestDto,
  MfaEnableResponseDto,
  MfaSetupResponseDto,
  MfaVerifyBackupCodeRequestDto,
  MfaVerifyRequestDto,
} from '~/types/contracts';
import { BaseRepository } from './base.repository';

export interface IMfaRepository {
  setup(): Promise<MfaSetupResponseDto>;
  enable(payload: MfaEnableRequestDto): Promise<MfaEnableResponseDto>;
  disable(payload: MfaDisableRequestDto): Promise<MfaDisableResponseDto>;
  verify(payload: MfaVerifyRequestDto): Promise<{ message: string }>;
  verifyBackupCode(
    payload: MfaVerifyBackupCodeRequestDto,
  ): Promise<{ message: string }>;
  regenerateBackupCodes(): Promise<GenerateBackupCodesResponseDto>;
}

export class MfaRepository extends BaseRepository implements IMfaRepository {
  setup(): Promise<MfaSetupResponseDto> {
    return this.post<MfaSetupResponseDto>('/iam/mfa/setup');
  }

  enable(payload: MfaEnableRequestDto): Promise<MfaEnableResponseDto> {
    return this.post<MfaEnableResponseDto>('/iam/mfa/enable', payload);
  }

  disable(payload: MfaDisableRequestDto): Promise<MfaDisableResponseDto> {
    return this.post<MfaDisableResponseDto>('/iam/mfa/disable', payload);
  }

  verify(payload: MfaVerifyRequestDto): Promise<{ message: string }> {
    return this.post<{ message: string }>('/iam/mfa/verify', payload);
  }

  verifyBackupCode(
    payload: MfaVerifyBackupCodeRequestDto,
  ): Promise<{ message: string }> {
    return this.post<{ message: string }>(
      '/iam/mfa/verify-backup-code',
      payload,
    );
  }

  regenerateBackupCodes(): Promise<GenerateBackupCodesResponseDto> {
    return this.post<GenerateBackupCodesResponseDto>(
      '/iam/mfa/backup-codes/regenerate',
    );
  }
}
