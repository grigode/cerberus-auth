import { CookieSerializeOptions } from '@fastify/cookie';

export const getCookieOptions = (isHttps: boolean): CookieSerializeOptions => {
  const config: CookieSerializeOptions = {
    httpOnly: true,
    path: '/',
    sameSite: 'lax',
    secure: false,
  };

  if (isHttps) {
    config.sameSite = 'none';
    config.secure = true;
  }

  return config;
};
