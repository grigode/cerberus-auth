import type {
  ActiveSessionDto,
  RevokeSessionResponseDto,
} from '~/types/contracts';
import { BaseRepository } from './base.repository';

export interface ISessionsRepository {
  getActiveSessions(): Promise<ActiveSessionDto[]>;
  revokeSession(sessionId: string): Promise<RevokeSessionResponseDto>;
  revokeAllSessions(): Promise<void>;
}

export class SessionsRepository
  extends BaseRepository
  implements ISessionsRepository
{
  getActiveSessions(): Promise<ActiveSessionDto[]> {
    return this.get<ActiveSessionDto[]>('/iam/sessions');
  }

  revokeSession(sessionId: string): Promise<RevokeSessionResponseDto> {
    return this.delete<RevokeSessionResponseDto>(`/iam/sessions/${sessionId}`);
  }

  revokeAllSessions(): Promise<void> {
    return this.post<void>('/iam/auth/logout-all');
  }
}
