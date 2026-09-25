import type { NitroFetchOptions, NitroFetchRequest } from 'nitropack';
import type { ApiClient } from '../api-client';

export abstract class BaseRepository {
  constructor(protected readonly client: ApiClient) {}

  protected get<T>(
    url: string,
    opts?: NitroFetchOptions<NitroFetchRequest>,
  ): Promise<T> {
    return this.client<T>(url, { method: 'GET', ...opts });
  }

  protected post<T>(
    url: string,
    body?: unknown,
    opts?: NitroFetchOptions<NitroFetchRequest>,
  ): Promise<T> {
    return this.client<T>(url, {
      method: 'POST',
      body:
        body !== undefined
          ? typeof body === 'string'
            ? body
            : JSON.stringify(body)
          : undefined,
      ...opts,
    });
  }

  protected patch<T>(
    url: string,
    body?: unknown,
    opts?: NitroFetchOptions<NitroFetchRequest>,
  ): Promise<T> {
    return this.client<T>(url, {
      method: 'PATCH',
      body:
        body !== undefined
          ? typeof body === 'string'
            ? body
            : JSON.stringify(body)
          : undefined,
      ...opts,
    });
  }

  protected delete<T>(
    url: string,
    opts?: NitroFetchOptions<NitroFetchRequest>,
  ): Promise<T> {
    return this.client<T>(url, { method: 'DELETE', ...opts });
  }
}
