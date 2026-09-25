import { useApiClient } from './use-api';
import {
  AuthRepository,
  type IAuthRepository,
  MfaRepository,
  type IMfaRepository,
  ProfileRepository,
  type IProfileRepository,
  SessionsRepository,
  type ISessionsRepository,
} from '~/services/api/repositories';

export interface Repositories {
  auth: IAuthRepository;
  mfa: IMfaRepository;
  profile: IProfileRepository;
  sessions: ISessionsRepository;
}

export const useRepositories = (): Repositories => {
  const nuxtApp = useNuxtApp();
  const context = nuxtApp as unknown as { _repositories?: Repositories };

  if (!context._repositories) {
    const api = useApiClient();
    context._repositories = {
      auth: new AuthRepository(api),
      mfa: new MfaRepository(api),
      profile: new ProfileRepository(api),
      sessions: new SessionsRepository(api),
    };
  }

  return context._repositories;
};

export const useAuthRepository = (): IAuthRepository => useRepositories().auth;
export const useMfaRepository = (): IMfaRepository => useRepositories().mfa;
export const useProfileRepository = (): IProfileRepository =>
  useRepositories().profile;
export const useSessionsRepository = (): ISessionsRepository =>
  useRepositories().sessions;
