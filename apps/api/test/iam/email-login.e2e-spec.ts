import type { INestApplication } from '@nestjs/common';
import { getTestingApp, type ErrorResponse } from 'src/common/tests';
import { UserEntity } from '@core/database';
import { MAIN_DATA_SOURCE } from '@core/database';
import request from 'supertest';
import type { App } from 'supertest/types';
import type { DataSource } from 'typeorm';

const apiUrl = '/api/iam/login';

describe(`Email Login (POST ${apiUrl})`, () => {
  let app: INestApplication<App>;

  beforeEach(async () => {
    const { testingApp } = await getTestingApp();
    app = testingApp;
    await app.listen(0);
  });

  describe('should respond with 400 when body is invalid', () => {
    const mostHaveErrorMessage = [
      'email must be an email',
      'password is not strong enough',
    ];

    it('with no body', async () => {
      const response = await request(app.getHttpServer()).post(apiUrl);
      const result: ErrorResponse = response.body;

      expect(result.statusCode).toBe(400);
      expect(result.message.length).toBe(mostHaveErrorMessage.length);
      expect(result.message).toEqual(
        expect.arrayContaining(mostHaveErrorMessage),
      );
    });

    it('with invalid email', async () => {
      const response = await request(app.getHttpServer()).post(apiUrl).send({
        email: 'not-an-email',
        password: 'Password123!@',
      });
      const result: ErrorResponse = response.body;

      expect(result.statusCode).toBe(400);
      expect(result.message.length).toBe(1);
      expect(result.message).toContain('email must be an email');
    });

    it('with weak password', async () => {
      const response = await request(app.getHttpServer()).post(apiUrl).send({
        email: 'test@example.com',
        password: 'weak',
      });
      const result: ErrorResponse = response.body;

      expect(result.statusCode).toBe(400);
      expect(result.message.length).toBe(1);
      expect(result.message).toContain('password is not strong enough');
    });
  });

  describe('fail paths (authentication & status checks)', () => {
    it('should return 400 when the email is not registered', async () => {
      const payload = {
        email: 'nonexistent@example.com',
        password: 'Password123!@',
      };

      const response = await request(app.getHttpServer())
        .post(apiUrl)
        .send(payload);

      expect(response.status).toBe(400);
    });

    it('should return 400 when the password is incorrect', async () => {
      const email = `test-${Date.now()}@example.com`;
      const password = 'Password123!@';

      // 1. Register the user
      const registerPayload = {
        firstName: 'Test',
        lastName: 'User',
        email,
        password,
      };

      await request(app.getHttpServer())
        .post('/api/iam/register-user')
        .send(registerPayload);

      // 2. Verify email in DB
      const dataSource = app.get<DataSource>(MAIN_DATA_SOURCE);
      const userRepository = dataSource.getRepository(UserEntity);
      await userRepository.update({ email }, { isEmailVerified: true });

      // 3. Try to login with incorrect password
      const loginPayload = {
        email,
        password: 'WrongPassword123!@',
      };

      const response = await request(app.getHttpServer())
        .post(apiUrl)
        .send(loginPayload);

      expect(response.status).toBe(400);
    });

    it('should return 403 when the email is not verified', async () => {
      const email = `test-${Date.now()}@example.com`;
      const password = 'Password123!@';

      // 1. Register the user (email verification is false by default)
      const registerPayload = {
        firstName: 'Test',
        lastName: 'User',
        email,
        password,
      };

      await request(app.getHttpServer())
        .post('/api/iam/register-user')
        .send(registerPayload);

      // 2. Login directly without verification
      const loginPayload = {
        email,
        password,
      };

      const response = await request(app.getHttpServer())
        .post(apiUrl)
        .send(loginPayload);

      expect(response.status).toBe(403);
    });

    it('should return 403 when the user is inactive', async () => {
      const email = `test-${Date.now()}@example.com`;
      const password = 'Password123!@';

      // 1. Register the user
      const registerPayload = {
        firstName: 'Test',
        lastName: 'User',
        email,
        password,
      };

      await request(app.getHttpServer())
        .post('/api/iam/register-user')
        .send(registerPayload);

      // 2. Set the user to inactive and verified in DB
      const dataSource = app.get<DataSource>(MAIN_DATA_SOURCE);
      const userRepository = dataSource.getRepository(UserEntity);
      await userRepository.update(
        { email },
        { isEmailVerified: true, isActive: false },
      );

      // 3. Login
      const loginPayload = {
        email,
        password,
      };

      const response = await request(app.getHttpServer())
        .post(apiUrl)
        .send(loginPayload);

      expect(response.status).toBe(403);
    });
  });

  describe('happy path', () => {
    it('should successfully login and set cookies when credentials are correct and email is verified', async () => {
      const email = `test-${Date.now()}@example.com`;
      const password = 'Password123!@';

      // 1. Register the user
      const registerPayload = {
        firstName: 'Test',
        lastName: 'User',
        email,
        password,
      };

      const registerResponse = await request(app.getHttpServer())
        .post('/api/iam/register-user')
        .send(registerPayload);

      expect(registerResponse.status).toBe(201);

      // 2. Verify the email in database
      const dataSource = app.get<DataSource>(MAIN_DATA_SOURCE);
      const userRepository = dataSource.getRepository(UserEntity);
      await userRepository.update({ email }, { isEmailVerified: true });

      // 3. Login
      const loginPayload = {
        email,
        password,
      };

      const response = await request(app.getHttpServer())
        .post(apiUrl)
        .send(loginPayload);

      expect(response.status).toBe(200);

      // 4. Verify cookies are set
      const cookies = response.headers['set-cookie'];
      expect(cookies).toBeDefined();
      expect(cookies).toEqual(
        expect.arrayContaining([
          expect.stringMatching(/^access_token=/),
          expect.stringMatching(/^refresh_token=/),
        ]),
      );

      // 5. Verify lastLoginAt is updated in database
      const updatedUser = await userRepository.findOne({
        where: { email },
      });
      expect(updatedUser?.lastLoginAt).toBeDefined();
      expect(updatedUser?.lastLoginAt).not.toBeNull();
    });
  });

  afterEach(async () => {
    await app.close();
  });
});
