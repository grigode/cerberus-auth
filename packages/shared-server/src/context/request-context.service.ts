import { AsyncLocalStorage } from 'node:async_hooks';

import { Injectable } from '@nestjs/common';

export interface RequestContextStore {
  correlationId: string;
  userId?: string;
  ipAddress?: string;
  userAgent?: string;
  startTime: number;
}

@Injectable()
export class RequestContextService {
  private static readonly als = new AsyncLocalStorage<RequestContextStore>();

  static run(store: RequestContextStore, callback: () => void) {
    RequestContextService.als.run(store, callback);
  }

  static getStore(): RequestContextStore | undefined {
    return RequestContextService.als.getStore();
  }

  get correlationId(): string | undefined {
    return RequestContextService.getStore()?.correlationId;
  }

  get userId(): string | undefined {
    return RequestContextService.getStore()?.userId;
  }

  set userId(id: string | undefined) {
    const store = RequestContextService.getStore();
    if (store) {
      store.userId = id;
    }
  }

  get ipAddress(): string | undefined {
    return RequestContextService.getStore()?.ipAddress;
  }

  get userAgent(): string | undefined {
    return RequestContextService.getStore()?.userAgent;
  }

  get startTime(): number | undefined {
    return RequestContextService.getStore()?.startTime;
  }
}
