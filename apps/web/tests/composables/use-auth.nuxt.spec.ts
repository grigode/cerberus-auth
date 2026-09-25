import { mockNuxtImport } from '@nuxt/test-utils/runtime';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useAuth } from '../../app/composables/use-auth.composable';

const { mockApi, mockNavigateTo } = vi.hoisted(() => ({
  mockApi: vi.fn(),
  mockNavigateTo: vi.fn(),
}));

mockNuxtImport('useApiClient', () => () => mockApi);
mockNuxtImport('navigateTo', () => mockNavigateTo);

describe('useAuth composable', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    const { clear } = useAuth();
    clear();
  });

  it('should initialize with unauthenticated state', () => {
    const { user, isAuthenticated } = useAuth();
    expect(user.value).toBeNull();
    expect(isAuthenticated.value).toBe(false);
  });

  it('should update user and isAuthenticated when setUser is called', () => {
    const { user, isAuthenticated, setUser } = useAuth();
    const mockUser = {
      id: 'usr-1',
      email: 'test@example.com',
      firstName: 'Alice',
      roles: ['USER'],
    };

    setUser(mockUser as any);
    expect(user.value).toEqual(mockUser);
    expect(isAuthenticated.value).toBe(true);
  });

  it('should fetch session and populate user on success', async () => {
    const mockProfileResponse = {
      id: 'usr-1',
      email: 'test@example.com',
      role: 'USER',
      isEmailVerified: true,
      isMfaEnabled: false,
      profile: {
        firstName: 'Alice',
        lastName: 'Smith',
      },
      providers: ['EMAIL'],
    };
    mockApi.mockResolvedValueOnce(mockProfileResponse);

    const { user, isAuthenticated, fetchSession } = useAuth();
    await fetchSession();

    expect(mockApi).toHaveBeenCalledWith('/iam/me', { method: 'GET' });
    expect(user.value).toEqual({
      id: 'usr-1',
      email: 'test@example.com',
      firstName: 'Alice',
      lastName: 'Smith',
      role: 'USER',
      isMfaEnabled: false,
      avatarUrl: undefined,
      language: undefined,
    });
    expect(isAuthenticated.value).toBe(true);
  });

  it('should clear user when fetchSession fails', async () => {
    mockApi.mockRejectedValueOnce(new Error('Unauthorized'));

    const { user, isAuthenticated, setUser, fetchSession } = useAuth();
    setUser({ id: 'usr-old' } as any);

    await fetchSession();

    expect(user.value).toBeNull();
    expect(isAuthenticated.value).toBe(false);
  });

  it('should call logout endpoint, clear session and navigate to /login', async () => {
    mockApi.mockResolvedValueOnce({ ok: true });

    const { user, setUser, logout } = useAuth();
    setUser({ id: 'usr-1' } as any);

    await logout();

    expect(mockApi).toHaveBeenCalledWith('/iam/logout', { method: 'POST' });
    expect(user.value).toBeNull();
    expect(mockNavigateTo).toHaveBeenCalledWith('/login');
  });

  it('should call logoutAll endpoint, clear session and navigate to /login', async () => {
    mockApi.mockResolvedValueOnce({ ok: true });

    const { user, setUser, logoutAll } = useAuth();
    setUser({ id: 'usr-1' } as any);

    await logoutAll();

    expect(mockApi).toHaveBeenCalledWith('/iam/auth/logout-all', {
      method: 'POST',
    });
    expect(user.value).toBeNull();
    expect(mockNavigateTo).toHaveBeenCalledWith('/login');
  });
});
