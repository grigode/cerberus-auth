import { randomUUID } from 'node:crypto';

import { Injectable, type NestMiddleware } from '@nestjs/common';
import type { FastifyReply, FastifyRequest } from 'fastify';

import {
  RequestContextService,
  type RequestContextStore,
} from './request-context.service';

interface RawRequest {
  headers?: Record<string, string | string[] | undefined>;
  socket?: { remoteAddress?: string };
}

interface RawResponse {
  setHeader?: (name: string, value: string) => void;
}

@Injectable()
export class RequestContextMiddleware implements NestMiddleware {
  use(
    req: FastifyRequest & { raw?: RawRequest },
    res: FastifyReply & { raw?: RawResponse },
    next: () => void,
  ) {
    const rawReq = req.raw || req;
    const rawRes = res.raw || res;

    const headers = rawReq.headers || {};
    const corrHeader = headers['x-correlation-id'] || headers['x-request-id'];
    const incomingCorrelationId =
      typeof corrHeader === 'string'
        ? corrHeader
        : Array.isArray(corrHeader)
          ? corrHeader[0]
          : undefined;

    const correlationId = incomingCorrelationId || randomUUID();

    if (typeof rawRes.setHeader === 'function') {
      rawRes.setHeader('x-correlation-id', correlationId);
    } else if (typeof res.header === 'function') {
      res.header('x-correlation-id', correlationId);
    }

    const forwardedFor = headers['x-forwarded-for'];
    const forwardedStr =
      typeof forwardedFor === 'string'
        ? forwardedFor
        : Array.isArray(forwardedFor)
          ? forwardedFor[0]
          : undefined;

    const ipAddress =
      forwardedStr?.split(',')[0] ||
      rawReq.socket?.remoteAddress ||
      req.ip ||
      'unknown';

    const rawUserAgent = headers['user-agent'];
    const userAgent =
      typeof rawUserAgent === 'string'
        ? rawUserAgent
        : Array.isArray(rawUserAgent)
          ? rawUserAgent[0]
          : 'unknown';

    const store: RequestContextStore = {
      correlationId,
      ipAddress,
      userAgent,
      startTime: Date.now(),
    };

    RequestContextService.run(store, () => {
      next();
    });
  }
}
