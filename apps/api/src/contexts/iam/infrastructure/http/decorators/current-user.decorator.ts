import { createParamDecorator, type ExecutionContext } from '@nestjs/common';
import type { FastifyRequest } from 'fastify';
import type { AuthenticatedUser } from '@core/domain';

export const currentUserFactory = (
  data: keyof AuthenticatedUser | undefined,
  ctx: ExecutionContext,
) => {
  const request = ctx.switchToHttp().getRequest<
    FastifyRequest & {
      user?: AuthenticatedUser;
      raw?: { user?: AuthenticatedUser };
    }
  >();
  const user = request.user || request.raw?.user;

  if (!user) {
    return undefined;
  }

  return data ? user[data] : user;
};

export const CurrentUser = createParamDecorator(currentUserFactory);
