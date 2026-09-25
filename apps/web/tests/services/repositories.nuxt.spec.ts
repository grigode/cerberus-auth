import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  AuthRepository,
  MfaRepository,
  ProfileRepository,
  SessionsRepository,
} from '../../app/services/api/repositories';

describe('Repository Layer Unit Tests', () => {
  let mockApiClient: any;

  beforeEach(() => {
    mockApiClient = vi.fn();
  });

  describe('AuthRepository', () => {
    it('should call /iam/login with POST method', async () => {
      const repo = new AuthRepository(mockApiClient);
      const payload = { email: 'test@example.com', password: 'password123' };
      mockApiClient.mockResolvedValueOnce({ message: 'Success' });

      const res = await repo.login(payload);

      expect(mockApiClient).toHaveBeenCalledWith('/iam/login', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      expect(res).toEqual({ message: 'Success' });
    });

    it('should call /iam/confirm-email with GET method and token query', async () => {
      const repo = new AuthRepository(mockApiClient);
      mockApiClient.mockResolvedValueOnce({ message: 'Email confirmed' });

      const res = await repo.confirmEmail('sample-token');

      expect(mockApiClient).toHaveBeenCalledWith('/iam/confirm-email', {
        method: 'GET',
        query: { token: 'sample-token' },
      });
      expect(res).toEqual({ message: 'Email confirmed' });
    });

    it('should call /iam/auth/change-password with POST', async () => {
      const repo = new AuthRepository(mockApiClient);
      const payload = {
        currentPassword: 'old',
        newPassword: 'new',
      };
      mockApiClient.mockResolvedValueOnce({ message: 'Password changed' });

      const res = await repo.changePassword(payload);

      expect(mockApiClient).toHaveBeenCalledWith('/iam/auth/change-password', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      expect(res).toEqual({ message: 'Password changed' });
    });

    it('should call /iam/logout and propagate errors', async () => {
      const repo = new AuthRepository(mockApiClient);
      mockApiClient.mockResolvedValueOnce(undefined);

      await repo.logout();
      expect(mockApiClient).toHaveBeenCalledWith('/iam/logout', {
        method: 'POST',
        body: undefined,
      });

      mockApiClient.mockRejectedValueOnce(new Error('Network error'));
      await expect(repo.logout()).rejects.toThrow('Network error');
    });

    it('should call /iam/auth/logout-all and propagate errors', async () => {
      const repo = new AuthRepository(mockApiClient);
      mockApiClient.mockResolvedValueOnce(undefined);

      await repo.logoutAll();
      expect(mockApiClient).toHaveBeenCalledWith('/iam/auth/logout-all', {
        method: 'POST',
        body: undefined,
      });

      mockApiClient.mockRejectedValueOnce(new Error('Network error'));
      await expect(repo.logoutAll()).rejects.toThrow('Network error');
    });
  });

  describe('MfaRepository', () => {
    it('should call /iam/mfa/setup with POST', async () => {
      const repo = new MfaRepository(mockApiClient);
      mockApiClient.mockResolvedValueOnce({
        secret: 'SEC',
        qrCodeUrl: 'url',
      });

      const res = await repo.setup();

      expect(mockApiClient).toHaveBeenCalledWith('/iam/mfa/setup', {
        method: 'POST',
        body: undefined,
      });
      expect(res.secret).toBe('SEC');
    });

    it('should call /iam/mfa/enable with POST', async () => {
      const repo = new MfaRepository(mockApiClient);
      const payload = { secret: 'SEC', code: '123456' };
      mockApiClient.mockResolvedValueOnce({
        message: 'MFA enabled',
        backupCodes: [],
      });

      const res = await repo.enable(payload);

      expect(mockApiClient).toHaveBeenCalledWith('/iam/mfa/enable', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      expect(res.message).toBe('MFA enabled');
    });

    it('should call /iam/mfa/backup-codes/regenerate with POST', async () => {
      const repo = new MfaRepository(mockApiClient);
      mockApiClient.mockResolvedValueOnce({ backupCodes: ['code-1'] });

      const res = await repo.regenerateBackupCodes();

      expect(mockApiClient).toHaveBeenCalledWith(
        '/iam/mfa/backup-codes/regenerate',
        {
          method: 'POST',
          body: undefined,
        },
      );
      expect(res.backupCodes).toEqual(['code-1']);
    });
  });

  describe('ProfileRepository', () => {
    it('should call /iam/me with GET', async () => {
      const repo = new ProfileRepository(mockApiClient);
      const profile = { id: 'u1', email: 'a@b.com' };
      mockApiClient.mockResolvedValueOnce(profile);

      const res = await repo.getProfile();

      expect(mockApiClient).toHaveBeenCalledWith('/iam/me', {
        method: 'GET',
      });
      expect(res).toEqual(profile);
    });
  });

  describe('SessionsRepository', () => {
    it('should call /iam/sessions with GET', async () => {
      const repo = new SessionsRepository(mockApiClient);
      mockApiClient.mockResolvedValueOnce([{ id: 's1' }]);

      const res = await repo.getActiveSessions();

      expect(mockApiClient).toHaveBeenCalledWith('/iam/sessions', {
        method: 'GET',
      });
      expect(res).toHaveLength(1);
    });

    it('should call /iam/sessions/:id with DELETE', async () => {
      const repo = new SessionsRepository(mockApiClient);
      mockApiClient.mockResolvedValueOnce({ message: 'Revoked' });

      const res = await repo.revokeSession('s1');

      expect(mockApiClient).toHaveBeenCalledWith('/iam/sessions/s1', {
        method: 'DELETE',
      });
      expect(res.message).toBe('Revoked');
    });
  });
});
