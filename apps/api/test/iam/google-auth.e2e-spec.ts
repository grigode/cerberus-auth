import type { INestApplication } from '@nestjs/common';
import { getTestingApp } from 'src/common/tests';
import { ProfileEntity } from '@core/database';
import { UserEntity } from '@core/database';
import { MAIN_DATA_SOURCE } from '@core/database';
import request from 'supertest';
import type { App } from 'supertest/types';
import type { DataSource } from 'typeorm';

describe('Google Authentication (E2E)', () => {
  let app: INestApplication<App>;
  let dataSource: DataSource;

  beforeEach(async () => {
    const { testingApp } = await getTestingApp();
    app = testingApp;
    dataSource = app.get<DataSource>(MAIN_DATA_SOURCE);
    await app.listen(0);
  });

  afterEach(async () => {
    jest.restoreAllMocks();
    await app.close();
  });

  describe('GET /api/iam/social/google', () => {
    it('should redirect to Google Consent screen', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/iam/social/google')
        .expect(302);

      expect(response.headers.location).toContain(
        'https://accounts.google.com/o/oauth2/v2/auth',
      );
      expect(response.headers.location).toContain('client_id=');
      expect(response.headers.location).toContain('redirect_uri=');
    });
  });

  describe('GET /api/iam/social/google/callback', () => {
    it('should redirect to frontend error page if code query parameter is missing', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/iam/social/google/callback')
        .expect(400);

      expect(response.status).toBe(400);
    });

    it('should create a new user and profile if user does not exist', async () => {
      const email = 'new-google-user@example.com';

      // Mock fetch token and userinfo calls
      const fetchSpy = jest.spyOn(global, 'fetch');
      fetchSpy
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({ access_token: 'mock-google-token' }),
        } as Response)
        .mockResolvedValueOnce({
          ok: true,
          json: () =>
            Promise.resolve({
              email,
              given_name: 'GoogleNew',
              family_name: 'UserNew',
            }),
        } as Response);

      const response = await request(app.getHttpServer())
        .get(
          '/api/iam/social/google/callback?code=valid-code&state=valid-state',
        )
        .expect(302);

      expect(response.headers.location).toBe('http://localhost:3000');

      // Verify cookies
      const cookies = response.headers['set-cookie'];
      expect(cookies).toBeDefined();
      expect(cookies).toEqual(
        expect.arrayContaining([
          expect.stringMatching(/^access_token=/),
          expect.stringMatching(/^refresh_token=/),
        ]),
      );

      // Verify database state
      const userRepository = dataSource.getRepository(UserEntity);
      const user = await userRepository.findOne({
        where: { email },
        relations: { providers: true },
      });
      expect(user).toBeDefined();
      expect(user?.email).toBe(email);
      expect(user?.isEmailVerified).toBe(true);
      expect(user?.providers.some((p) => p.name === 'google')).toBe(true);

      const profileRepository = dataSource.getRepository(ProfileEntity);
      const profile = await profileRepository.findOne({
        where: { userId: user?.id },
      });
      expect(profile).toBeDefined();
      expect(profile?.firstName).toBe('GoogleNew');
      expect(profile?.lastName).toBe('UserNew');
    });

    it('should link the account if the user exists under email provider but does not have Google provider', async () => {
      const email = 'existing-email-user@example.com';

      // 1. Create email user in DB (simulate registered user)
      const registerPayload = {
        firstName: 'Existing',
        lastName: 'Email',
        email,
        password: 'Password123!@',
      };
      await request(app.getHttpServer())
        .post('/api/iam/register-user')
        .send(registerPayload)
        .expect(201);

      // Verify email isn't verified initially
      const userRepository = dataSource.getRepository(UserEntity);
      const initialUser = await userRepository.findOne({
        where: { email },
        relations: { providers: true },
      });
      expect(initialUser?.isEmailVerified).toBe(false);
      expect(initialUser?.providers.some((p) => p.name === 'google')).toBe(
        false,
      );

      // 2. Perform Google Callback
      const fetchSpy = jest.spyOn(global, 'fetch');
      fetchSpy
        .mockResolvedValueOnce({
          ok: true,
          json: () =>
            Promise.resolve({ access_token: 'mock-google-token-link' }),
        } as Response)
        .mockResolvedValueOnce({
          ok: true,
          json: () =>
            Promise.resolve({
              email,
              given_name: 'Existing',
              family_name: 'Email',
            }),
        } as Response);

      const response = await request(app.getHttpServer())
        .get(
          '/api/iam/social/google/callback?code=valid-code&state=valid-state',
        )
        .expect(302);

      expect(response.headers.location).toBe('http://localhost:3000');

      // Verify cookies are set
      const cookies = response.headers['set-cookie'];
      expect(cookies).toBeDefined();

      // 3. Verify user has both providers now and email is verified
      const updatedUser = await userRepository.findOne({
        where: { email },
        relations: { providers: true },
      });
      expect(updatedUser?.isEmailVerified).toBe(true);
      expect(updatedUser?.providers.length).toBe(2);
      expect(updatedUser?.providers.some((p) => p.name === 'email')).toBe(true);
      expect(updatedUser?.providers.some((p) => p.name === 'google')).toBe(
        true,
      );
    });

    it('should redirect to frontend error page if the existing user is inactive', async () => {
      const email = 'inactive-google-user@example.com';

      // 1. Register and deactivate user
      const registerPayload = {
        firstName: 'Inactive',
        lastName: 'User',
        email,
        password: 'Password123!@',
      };
      await request(app.getHttpServer())
        .post('/api/iam/register-user')
        .send(registerPayload)
        .expect(201);

      const userRepository = dataSource.getRepository(UserEntity);
      await userRepository.update({ email }, { isActive: false });

      // 2. Perform Google Callback
      const fetchSpy = jest.spyOn(global, 'fetch');
      fetchSpy
        .mockResolvedValueOnce({
          ok: true,
          json: () =>
            Promise.resolve({ access_token: 'mock-google-token-inactive' }),
        } as Response)
        .mockResolvedValueOnce({
          ok: true,
          json: () =>
            Promise.resolve({
              email,
              given_name: 'Inactive',
              family_name: 'User',
            }),
        } as Response);

      const response = await request(app.getHttpServer())
        .get(
          '/api/iam/social/google/callback?code=valid-code&state=valid-state',
        )
        .expect(302);

      expect(response.headers.location).toContain(
        'http://localhost:3000/auth/error?message=',
      );
      expect(response.headers.location).toContain('inactive');
    });
  });
});
