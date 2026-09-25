import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createApiClient } from '../../app/services/api/api-client';

describe('createApiClient (Resilient API Client & Mutex)', () => {
  beforeEach(() => {
    vi.stubGlobal('useRuntimeConfig', () => ({
      public: { apiBaseUrl: 'http://localhost:8000/api' },
    }));
    vi.stubGlobal('navigateTo', vi.fn());
    vi.stubGlobal('useState', () => ({ value: null }));
  });

  it('should instantiate the api client function', () => {
    const client = createApiClient();
    expect(typeof client).toBe('function');
  });

  it('should forward successful responses from $fetch.raw', async () => {
    const mockData = { id: 'user-123', email: 'test@example.com' };
    const mockRaw = vi.fn().mockResolvedValue({
      _data: mockData,
      headers: new Headers(),
    });
    const mockFetch: any = vi.fn();
    mockFetch.raw = mockRaw;
    vi.stubGlobal('$fetch', mockFetch);

    const client = createApiClient();
    const result = await client<typeof mockData>('/iam/me');

    expect(result).toEqual(mockData);
    expect(mockRaw).toHaveBeenCalledWith(
      '/iam/me',
      expect.objectContaining({
        credentials: 'include',
      }),
    );
  });

  it('should not attempt silent refresh for bypass endpoints on 401', async () => {
    const error401 = { status: 401 };
    const mockRaw = vi.fn().mockRejectedValue(error401);
    const mockFetch: any = vi.fn();
    mockFetch.raw = mockRaw;
    vi.stubGlobal('$fetch', mockFetch);

    const client = createApiClient();

    await expect(client('/iam/login')).rejects.toEqual(error401);
    // Should have only called once and NOT called refresh-token
    expect(mockRaw).toHaveBeenCalledTimes(1);
    expect(mockRaw).not.toHaveBeenCalledWith(
      'http://localhost:8000/api/iam/refresh-token',
      expect.anything(),
    );
  });

  it('should trigger silent refresh on 401 and retry original request when refresh succeeds', async () => {
    const error401 = { status: 401 };
    const successData = { success: true };

    const mockRaw = vi.fn();
    // First call (/iam/me) fails with 401
    mockRaw.mockRejectedValueOnce(error401);
    // Second call (/iam/refresh-token) succeeds
    mockRaw.mockResolvedValueOnce({
      _data: { ok: true },
      headers: new Headers(),
    });
    // Third call (retry /iam/me) succeeds
    mockRaw.mockResolvedValueOnce({
      _data: successData,
      headers: new Headers(),
    });

    const mockFetch: any = vi.fn();
    mockFetch.raw = mockRaw;
    vi.stubGlobal('$fetch', mockFetch);

    const client = createApiClient();
    const result = await client('/iam/me');

    expect(result).toEqual(successData);
    expect(mockRaw).toHaveBeenCalledTimes(3);
    expect(mockRaw).toHaveBeenNthCalledWith(
      2,
      '/iam/refresh-token',
      expect.anything(),
    );
  });
});
