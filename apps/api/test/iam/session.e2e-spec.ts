import type { INestApplication } from '@nestjs/common';
import { getTestingApp } from 'src/common/tests';
import { RefreshTokenEntity } from '@core/database';
import { UserEntity } from '@core/database';
import { MAIN_DATA_SOURCE } from '@core/database';
import request from 'supertest';
import type { App } from 'supertest/types';
import type { DataSource } from 'typeorm';

describe('Session Rotation & Logout E2E', () => {
  let app: INestApplication<App>;
  let dataSource: DataSource;

  beforeEach(async () => {
    const { testingApp } = await getTestingApp();
    app = testingApp;
    await app.listen(0);
    dataSource = app.get<DataSource>(MAIN_DATA_SOURCE);
  });

  const getCookieValue = (
    cookies: string | string[] | undefined,
    name: string,
  ): string | null => {
    if (!cookies) return null;
    const cookieArray = Array.isArray(cookies) ? cookies : [cookies];
    for (const cookie of cookieArray) {
      if (cookie.startsWith(`${name}=`)) {
        return cookie.split(';')[0].split('=')[1];
      }
    }
    return null;
  };

  const setupVerifiedUser = async (
    email: string,
    password = 'Password123!@',
  ) => {
    await request(app.getHttpServer()).post('/api/iam/register-user').send({
      firstName: 'Session',
      lastName: 'Tester',
      email,
      password,
    });

    const userRepository = dataSource.getRepository(UserEntity);
    await userRepository.update({ email }, { isEmailVerified: true });
  };

  describe('POST /api/iam/refresh-token', () => {
    it('should successfully rotate tokens with a valid refresh token', async () => {
      const email = `test-session-${Date.now()}@example.com`;
      const password = 'Password123!@';

      await setupVerifiedUser(email, password);

      // Login to get cookies
      const loginRes = await request(app.getHttpServer())
        .post('/api/iam/login')
        .send({ email, password });

      expect(loginRes.status).toBe(200);

      const loginCookies = loginRes.headers['set-cookie'];
      const originalRefreshToken = getCookieValue(
        loginCookies,
        'refresh_token',
      );
      const originalAccessToken = getCookieValue(loginCookies, 'access_token');

      expect(originalRefreshToken).toBeDefined();
      expect(originalAccessToken).toBeDefined();

      // Wait a tiny bit to ensure timestamps are slightly different if needed
      await new Promise((resolve) => setTimeout(resolve, 50));

      // Request rotation
      const rotateRes = await request(app.getHttpServer())
        .post('/api/iam/refresh-token')
        .set('Cookie', `refresh_token=${originalRefreshToken}`);

      expect(rotateRes.status).toBe(200);

      const rotateCookies = rotateRes.headers['set-cookie'];
      const newRefreshToken = getCookieValue(rotateCookies, 'refresh_token');
      const newAccessToken = getCookieValue(rotateCookies, 'access_token');

      expect(newRefreshToken).toBeDefined();
      expect(newAccessToken).toBeDefined();
      expect(newRefreshToken).not.toBe(originalRefreshToken);

      // Check DB: original token should be marked revoked
      const refreshTokenRepository =
        dataSource.getRepository(RefreshTokenEntity);
      const originalTokenInDb = await refreshTokenRepository.findOne({
        where: { token: originalRefreshToken! },
      });
      expect(originalTokenInDb?.revokedAt).toBeDefined();
      expect(originalTokenInDb?.revokedAt).not.toBeNull();

      // Check DB: new token should exist and not be revoked
      const newTokenInDb = await refreshTokenRepository.findOne({
        where: { token: newRefreshToken! },
      });
      expect(newTokenInDb).toBeDefined();
      expect(newTokenInDb?.revokedAt).toBeNull();
    });

    it('should fail with 400 if refresh token is missing', async () => {
      const response = await request(app.getHttpServer()).post(
        '/api/iam/refresh-token',
      );

      expect(response.status).toBe(400);
      expect(response.body.code).toBe('INVALID_REFRESH_TOKEN');
    });

    it('should fail with 400 if refresh token is not found in database', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/iam/refresh-token')
        .set('Cookie', 'refresh_token=nonexistenttokenhere');

      expect(response.status).toBe(400);
      expect(response.body.code).toBe('INVALID_REFRESH_TOKEN');
    });

    it('should fail with 400 if refresh token is already revoked', async () => {
      const email = `test-revoked-${Date.now()}@example.com`;
      const password = 'Password123!@';

      await setupVerifiedUser(email, password);

      const loginRes = await request(app.getHttpServer())
        .post('/api/iam/login')
        .send({ email, password });

      const originalRefreshToken = getCookieValue(
        loginRes.headers['set-cookie'],
        'refresh_token',
      );

      // First rotation
      const rotate1Res = await request(app.getHttpServer())
        .post('/api/iam/refresh-token')
        .set('Cookie', `refresh_token=${originalRefreshToken}`);
      expect(rotate1Res.status).toBe(200);

      // Second rotation with the same (now revoked) token
      const rotate2Res = await request(app.getHttpServer())
        .post('/api/iam/refresh-token')
        .set('Cookie', `refresh_token=${originalRefreshToken}`);

      expect(rotate2Res.status).toBe(400);
      expect(rotate2Res.body.code).toBe('INVALID_REFRESH_TOKEN');
    });
  });

  describe('POST /api/iam/logout', () => {
    it('should invalidate token and clear cookies successfully', async () => {
      const email = `test-logout-${Date.now()}@example.com`;
      const password = 'Password123!@';

      await setupVerifiedUser(email, password);

      const loginRes = await request(app.getHttpServer())
        .post('/api/iam/login')
        .send({ email, password });

      const originalRefreshToken = getCookieValue(
        loginRes.headers['set-cookie'],
        'refresh_token',
      );

      // Logout request
      const logoutRes = await request(app.getHttpServer())
        .post('/api/iam/logout')
        .set('Cookie', `refresh_token=${originalRefreshToken}`);

      expect(logoutRes.status).toBe(204);

      // Check cookies cleared in set-cookie header
      const logoutCookies = logoutRes.headers['set-cookie'];
      expect(logoutCookies).toBeDefined();

      const clearedAccessToken = getCookieValue(logoutCookies, 'access_token');
      const clearedRefreshToken = getCookieValue(
        logoutCookies,
        'refresh_token',
      );

      // In fastify, clearCookie usually sets value to empty string and maxAge to 0/expires to past
      expect(clearedAccessToken === '' || !clearedAccessToken).toBe(true);
      expect(clearedRefreshToken === '' || !clearedRefreshToken).toBe(true);

      // Check DB: token should be revoked
      const refreshTokenRepository =
        dataSource.getRepository(RefreshTokenEntity);
      const tokenInDb = await refreshTokenRepository.findOne({
        where: { token: originalRefreshToken! },
      });
      expect(tokenInDb?.revokedAt).toBeDefined();
      expect(tokenInDb?.revokedAt).not.toBeNull();
    });

    it('should return 204 and clear cookies even if token is invalid or missing', async () => {
      const logoutRes = await request(app.getHttpServer())
        .post('/api/iam/logout')
        .set('Cookie', 'refresh_token=invalidtoken');

      expect(logoutRes.status).toBe(204);

      const logoutCookies = logoutRes.headers['set-cookie'];
      expect(logoutCookies).toBeDefined();

      const clearedAccessToken = getCookieValue(logoutCookies, 'access_token');
      const clearedRefreshToken = getCookieValue(
        logoutCookies,
        'refresh_token',
      );
      expect(clearedAccessToken === '' || !clearedAccessToken).toBe(true);
      expect(clearedRefreshToken === '' || !clearedRefreshToken).toBe(true);
    });
  });

  afterEach(async () => {
    await app.close();
  });
});
