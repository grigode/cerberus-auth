import type { INestApplication } from '@nestjs/common';
import { getTestingApp } from 'src/common/tests';
import { UserEntity } from '@core/database';
import { LanguageCode } from '@core/domain';
import { MAIN_DATA_SOURCE } from '@core/database';
import request from 'supertest';
import type { App } from 'supertest/types';
import type { DataSource } from 'typeorm';

describe('User Profile E2E', () => {
  let app: INestApplication<App>;
  let dataSource: DataSource;

  beforeEach(async () => {
    const { testingApp } = await getTestingApp();
    app = testingApp;
    await app.listen(0);
    dataSource = app.get<DataSource>(MAIN_DATA_SOURCE);
  }, 15000);

  afterEach(async () => {
    if (app) {
      await app.close();
    }
  }, 15000);

  const getCookieValue = (
    cookies: string | string[] | undefined,
    name: string,
  ): string | null => {
    if (!cookies) return null;
    const cookieArray = Array.isArray(cookies) ? cookies : [cookies];
    for (const cookie of cookieArray) {
      const parts = cookie.split(';')[0].split('=');
      if (parts[0] === name) {
        return parts.slice(1).join('=');
      }
    }
    return null;
  };

  const setupAuthenticatedUser = async (
    email: string,
    password = 'Password123!@',
  ) => {
    await request(app.getHttpServer()).post('/api/iam/register-user').send({
      firstName: 'Profile',
      lastName: 'User',
      email,
      password,
    });

    const userRepository = dataSource.getRepository(UserEntity);
    await userRepository.update({ email }, { isEmailVerified: true });

    const loginRes = await request(app.getHttpServer())
      .post('/api/iam/login')
      .send({ email, password });

    expect(loginRes.status).toBe(200);

    const accessToken = getCookieValue(
      loginRes.headers['set-cookie'],
      'access_token',
    );

    expect(accessToken).toBeDefined();

    return { accessToken: accessToken! };
  };

  describe('GET /api/iam/profile', () => {
    it('should fail with 401 if unauthenticated', async () => {
      const response = await request(app.getHttpServer()).get(
        '/api/iam/profile',
      );
      expect(response.status).toBe(401);
    });

    it('should successfully return authenticated user profile', async () => {
      const email = `test-profile-${Date.now()}@example.com`;
      const { accessToken } = await setupAuthenticatedUser(email);

      const response = await request(app.getHttpServer())
        .get('/api/iam/profile')
        .set('Cookie', `access_token=${accessToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        id: expect.any(String),
        email,
        role: 'USER',
        isActive: true,
        isEmailVerified: true,
        isMfaEnabled: false,
        createdAt: expect.any(String),
        updatedAt: expect.any(String),
        lastLoginAt: expect.any(String),
        providers: ['EMAIL'],
        profile: {
          firstName: 'Profile',
          lastName: 'User',
          avatarUrl: null,
          language: 'EN',
        },
      });
    }, 15000);

    it('should also work with GET /api/iam/me alias', async () => {
      const email = `test-me-${Date.now()}@example.com`;
      const { accessToken } = await setupAuthenticatedUser(email);

      const response = await request(app.getHttpServer())
        .get('/api/iam/me')
        .set('Cookie', `access_token=${accessToken}`);

      expect(response.status).toBe(200);
      expect(response.body.email).toBe(email);
    }, 15000);
  });

  describe('PATCH /api/iam/profile', () => {
    it('should fail with 401 if unauthenticated', async () => {
      const response = await request(app.getHttpServer())
        .patch('/api/iam/profile')
        .send({ firstName: 'Updated' });

      expect(response.status).toBe(401);
    });

    it('should update profile fields successfully', async () => {
      const email = `test-update-${Date.now()}@example.com`;
      const { accessToken } = await setupAuthenticatedUser(email);

      const response = await request(app.getHttpServer())
        .patch('/api/iam/profile')
        .set('Cookie', `access_token=${accessToken}`)
        .send({
          firstName: 'UpdatedFirstName',
          lastName: 'UpdatedLastName',
          avatarUrl: 'https://example.com/new-avatar.png',
          language: LanguageCode.ES,
        });

      expect(response.status).toBe(200);
      expect(response.body.profile).toEqual({
        firstName: 'UpdatedFirstName',
        lastName: 'UpdatedLastName',
        avatarUrl: 'https://example.com/new-avatar.png',
        language: 'ES',
      });

      // Verify persistence via GET /api/iam/profile
      const getRes = await request(app.getHttpServer())
        .get('/api/iam/profile')
        .set('Cookie', `access_token=${accessToken}`);

      expect(getRes.status).toBe(200);
      expect(getRes.body.profile).toEqual({
        firstName: 'UpdatedFirstName',
        lastName: 'UpdatedLastName',
        avatarUrl: 'https://example.com/new-avatar.png',
        language: 'ES',
      });
    }, 15000);
  });
});
