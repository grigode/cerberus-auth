import { Injectable } from '@nestjs/common';
import { ThrottlerGuard } from '@nestjs/throttler';

interface RequestWithBodyAndHeaders {
  ip?: string;
  headers?: Record<string, string | string[] | undefined>;
  body?: unknown;
}

@Injectable()
export class CustomThrottlerGuard extends ThrottlerGuard {
  protected getTracker(req: Record<string, unknown>): Promise<string> {
    const request = req as unknown as RequestWithBodyAndHeaders;
    const headerIp = Array.isArray(request.headers?.['x-forwarded-for'])
      ? request.headers['x-forwarded-for'][0]
      : request.headers?.['x-forwarded-for'];

    const clientIp = request.ip || headerIp || '127.0.0.1';

    if (
      request.body &&
      typeof request.body === 'object' &&
      'email' in request.body &&
      typeof request.body.email === 'string'
    ) {
      const email = (request.body as { email: string }).email
        .trim()
        .toLowerCase();
      if (email.length > 0) {
        return Promise.resolve(`${clientIp}-${email}`);
      }
    }

    return Promise.resolve(clientIp);
  }
}
