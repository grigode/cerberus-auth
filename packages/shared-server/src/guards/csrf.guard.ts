import {
  type CanActivate,
  type ExecutionContext,
  Injectable,
} from '@nestjs/common';
import type { FastifyRequest } from 'fastify';
// biome-ignore lint/style/useImportType: Needed as runtime value for NestJS DI metadata
import { SecurityConfigService } from '@core/config';
import { ForbiddenApplicationException } from '../application/exceptions';

@Injectable()
export class CsrfGuard implements CanActivate {
  constructor(private readonly securityConfig: SecurityConfigService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<FastifyRequest>();
    const method = request.method.toUpperCase();

    // Safe HTTP methods do not modify state and don't need CSRF protection
    if (['GET', 'HEAD', 'OPTIONS'].includes(method)) {
      return true;
    }

    // Check if request carries cookies (CSRF only threatens ambient credentials like cookies)
    const hasCookies =
      Boolean(
        request.cookies &&
          Object.keys(request.cookies as Record<string, unknown>).length > 0,
      ) || Boolean(request.headers.cookie);

    if (!hasCookies) {
      return true;
    }

    // Check for custom header that cannot be set cross-origin without CORS preflight
    const customHeader =
      request.headers['x-requested-with'] || request.headers['x-csrf-token'];
    if (customHeader) {
      return true;
    }

    // Origin or Referer header validation
    const origin = (request.headers.origin as string) || '';
    const referer = (request.headers.referer as string) || '';
    const sourceUrl = origin || referer;

    if (!sourceUrl) {
      throw new ForbiddenApplicationException(
        'CSRF_PROTECTION',
        'Missing Origin or Referer header for cookie-authenticated state-modifying request',
      );
    }

    let sourceOrigin: string;
    let sourceHost: string;
    try {
      const parsedUrl = new URL(sourceUrl);
      sourceOrigin = parsedUrl.origin;
      sourceHost = parsedUrl.host;
    } catch {
      throw new ForbiddenApplicationException(
        'CSRF_PROTECTION',
        'Invalid Origin or Referer header format',
      );
    }

    // Allow if source matches request host (same origin)
    const requestHost = request.headers.host;
    if (requestHost && sourceHost === requestHost) {
      return true;
    }

    // Allow if origin is in CORS_ORIGINS
    const allowedOrigins = this.securityConfig.CORS_ORIGINS;
    const isAllowed = allowedOrigins.some((allowed) => {
      if (allowed === '*') return true;
      try {
        return new URL(allowed).origin === sourceOrigin;
      } catch {
        return false;
      }
    });

    if (!isAllowed) {
      throw new ForbiddenApplicationException(
        'CSRF_PROTECTION',
        'Cross-site request blocked by CSRF protection',
      );
    }

    return true;
  }
}
