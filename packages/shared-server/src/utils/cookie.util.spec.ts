import { getCookieOptions } from './cookie.util';

describe('getCookieOptions', () => {
  it('should return HTTP-only, secure=false, sameSite=lax for HTTP (isHttps = false)', () => {
    const options = getCookieOptions(false);
    expect(options).toEqual({
      httpOnly: true,
      path: '/',
      sameSite: 'lax',
      secure: false,
    });
  });

  it('should return HTTP-only, secure=true, sameSite=none for HTTPS (isHttps = true)', () => {
    const options = getCookieOptions(true);
    expect(options).toEqual({
      httpOnly: true,
      path: '/',
      sameSite: 'none',
      secure: true,
    });
  });
});
