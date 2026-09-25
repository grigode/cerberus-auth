import { mockNuxtImport } from '@nuxt/test-utils/runtime';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useRegister } from '../../app/features/auth/pages/register/register.composable';

const { mockRegister, mockRouterPush } = vi.hoisted(() => ({
  mockRegister: vi.fn(),
  mockRouterPush: vi.fn(),
}));

mockNuxtImport('useAuthRepository', () => () => ({
  register: mockRegister,
}));
mockNuxtImport('useI18nShorter', () => () => ({
  t: (key: string) => key,
  ts: (key: string) => key,
}));
mockNuxtImport('useRouter', () => () => ({
  push: mockRouterPush,
  replace: vi.fn(),
  afterEach: vi.fn(),
  beforeResolve: vi.fn(),
}));
mockNuxtImport('useAuthFeedback', () => () => ({
  notifyApiError: vi.fn(),
}));
mockNuxtImport('useGoogleAuth', () => () => ({
  redirecting: { value: false },
  loginWithGoogle: vi.fn(),
}));

describe('useRegister Composable & Password Policy', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should reject passwords under 12 characters or missing character classes', () => {
    const { schema } = useRegister();

    // Less than 12 chars
    const shortPassword = schema.safeParse({
      firstName: 'Alice',
      lastName: 'Doe',
      email: 'alice@example.com',
      password: 'Short1!',
      confirmPassword: 'Short1!',
    });
    expect(shortPassword.success).toBe(false);

    // Missing symbol
    const noSymbol = schema.safeParse({
      firstName: 'Alice',
      lastName: 'Doe',
      email: 'alice@example.com',
      password: 'Password12345',
      confirmPassword: 'Password12345',
    });
    expect(noSymbol.success).toBe(false);
  });

  it('should reject when confirmPassword does not match password', () => {
    const { schema } = useRegister();

    const mismatch = schema.safeParse({
      firstName: 'Alice',
      lastName: 'Doe',
      email: 'alice@example.com',
      password: 'ValidPassword123!',
      confirmPassword: 'DifferentPassword123!',
    });
    expect(mismatch.success).toBe(false);
  });

  it('should accept compliant registrations matching OWASP & NIST standards', () => {
    const { schema } = useRegister();

    const valid = schema.safeParse({
      firstName: 'Alice',
      lastName: 'Smith',
      email: 'alice.smith@example.com',
      password: 'CorrectHorseBatteryStaple123!',
      confirmPassword: 'CorrectHorseBatteryStaple123!',
    });
    expect(valid.success).toBe(true);
  });

  it('should call register-user and redirect to /confirm-email-pending on success', async () => {
    mockRegister.mockResolvedValueOnce({
      message: 'User registered',
      id: 'usr-new',
    });

    const { onSubmit } = useRegister();
    await onSubmit({
      data: {
        firstName: 'Alice',
        lastName: 'Smith',
        email: 'alice@example.com',
        password: 'ValidPassword123!',
        confirmPassword: 'ValidPassword123!',
      },
    } as any);

    expect(mockRegister).toHaveBeenCalledWith({
      firstName: 'Alice',
      lastName: 'Smith',
      email: 'alice@example.com',
      password: 'ValidPassword123!',
    });
    expect(mockRouterPush).toHaveBeenCalledWith('/confirm-email-pending');
  });
});
