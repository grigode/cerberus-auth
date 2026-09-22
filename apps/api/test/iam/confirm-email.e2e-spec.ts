import type { INestApplication } from '@nestjs/common';
import { getTestingApp, type ErrorResponse } from 'src/common/tests';
import { ConfirmationTokenEntity } from '@core/database';
import { UserEntity } from '@core/database';
import { MAIN_DATA_SOURCE } from '@core/database';
import request from 'supertest';
import type { App } from 'supertest/types';
import type { DataSource } from 'typeorm';

describe('Confirm Email & Resend Confirmation (E2E)', () => {
  let app: INestApplication<App>;
  let dataSource: DataSource;

  beforeEach(async () => {
    const { testingApp } = await getTestingApp();
    app = testingApp;
    await app.listen(0);
    dataSource = app.get<DataSource>(MAIN_DATA_SOURCE);
  });

  afterEach(async () => {
    await app.close();
  });

  describe('Confirm Email (GET /api/iam/confirm-email)', () => {
    const confirmUrl = '/api/iam/confirm-email';

    it('should respond with 400 when token is missing', async () => {
      const response = await request(app.getHttpServer()).get(confirmUrl);
      const result: ErrorResponse = response.body;

      expect(response.status).toBe(400);
      expect(result.message).toEqual(
        expect.arrayContaining([
          'token should not be empty',
          'token must be a string',
        ]),
      );
    });

    it('should respond with 400 when token is empty', async () => {
      const response = await request(app.getHttpServer())
        .get(confirmUrl)
        .query({ token: '' });
      const result: ErrorResponse = response.body;

      expect(response.status).toBe(400);
      expect(result.message).toContain('token should not be empty');
    });

    it('should respond with 404 when token does not exist', async () => {
      const response = await request(app.getHttpServer())
        .get(confirmUrl)
        .query({ token: 'nonexistent-token-123456789012' });

      expect(response.status).toBe(404);
      expect(response.body.message).toContain('not found');
    });

    it('should successfully confirm email with a valid token', async () => {
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

      // 2. Fetch the confirmation token from database
      const userRepository = dataSource.getRepository(UserEntity);
      const confirmationTokenRepository = dataSource.getRepository(
        ConfirmationTokenEntity,
      );

      const user = await userRepository.findOne({ where: { email } });
      expect(user).toBeDefined();

      const confirmationToken = await confirmationTokenRepository.findOne({
        where: { user: { id: user!.id } },
      });
      expect(confirmationToken).toBeDefined();
      expect(confirmationToken?.token).toBeDefined();

      // 3. Confirm email
      const confirmResponse = await request(app.getHttpServer())
        .get(confirmUrl)
        .query({ token: confirmationToken?.token });

      expect(confirmResponse.status).toBe(200);

      // 4. Verify user and token state in DB
      const updatedUser = await userRepository.findOne({ where: { email } });
      expect(updatedUser?.isEmailVerified).toBe(true);

      const updatedToken = await confirmationTokenRepository.findOne({
        where: { id: confirmationToken?.id },
      });
      expect(updatedToken?.usedAt).toBeDefined();
      expect(updatedToken?.usedAt).not.toBeNull();
    });

    it('should respond with 400 when token is already used', async () => {
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

      // 2. Get token and mark it as used in DB
      const userRepository = dataSource.getRepository(UserEntity);
      const confirmationTokenRepository = dataSource.getRepository(
        ConfirmationTokenEntity,
      );

      const user = await userRepository.findOne({ where: { email } });
      expect(user).toBeDefined();
      const confirmationToken = await confirmationTokenRepository.findOne({
        where: { user: { id: user!.id } },
      });

      await confirmationTokenRepository.update(
        { id: confirmationToken?.id },
        { usedAt: new Date() },
      );

      // 3. Attempt to confirm
      const confirmResponse = await request(app.getHttpServer())
        .get(confirmUrl)
        .query({ token: confirmationToken?.token });

      expect(confirmResponse.status).toBe(400);
      expect(confirmResponse.body.message).toContain(
        'Confirmation token is invalid',
      );
    });

    it('should respond with 400 when token is expired', async () => {
      const email = `test-${Date.now()}@example.com`;
      const password = 'Password123!@';

      // 1. Register user
      const registerPayload = {
        firstName: 'Test',
        lastName: 'User',
        email,
        password,
      };
      await request(app.getHttpServer())
        .post('/api/iam/register-user')
        .send(registerPayload);

      // 2. Get token and set expiresAt to past date in DB
      const userRepository = dataSource.getRepository(UserEntity);
      const confirmationTokenRepository = dataSource.getRepository(
        ConfirmationTokenEntity,
      );

      const user = await userRepository.findOne({ where: { email } });
      expect(user).toBeDefined();
      const confirmationToken = await confirmationTokenRepository.findOne({
        where: { user: { id: user!.id } },
      });

      await confirmationTokenRepository.update(
        { id: confirmationToken?.id },
        { expiresAt: new Date('2020-01-01') },
      );

      // 3. Attempt to confirm
      const confirmResponse = await request(app.getHttpServer())
        .get(confirmUrl)
        .query({ token: confirmationToken?.token });

      expect(confirmResponse.status).toBe(400);
      expect(confirmResponse.body.message).toContain(
        'Confirmation token is invalid',
      );
    });

    it('should respond with 403 when user is inactive', async () => {
      const email = `test-${Date.now()}@example.com`;
      const password = 'Password123!@';

      // 1. Register user
      const registerPayload = {
        firstName: 'Test',
        lastName: 'User',
        email,
        password,
      };
      await request(app.getHttpServer())
        .post('/api/iam/register-user')
        .send(registerPayload);

      // 2. Get user & token, set user to inactive in DB
      const userRepository = dataSource.getRepository(UserEntity);
      const confirmationTokenRepository = dataSource.getRepository(
        ConfirmationTokenEntity,
      );

      const user = await userRepository.findOne({ where: { email } });
      expect(user).toBeDefined();
      const confirmationToken = await confirmationTokenRepository.findOne({
        where: { user: { id: user!.id } },
      });

      await userRepository.update({ id: user!.id }, { isActive: false });

      // 3. Attempt to confirm
      const confirmResponse = await request(app.getHttpServer())
        .get(confirmUrl)
        .query({ token: confirmationToken?.token });

      expect(confirmResponse.status).toBe(403);
      expect(confirmResponse.body.message).toContain('is inactive');
    });
  });

  describe('Resend Confirmation Email (POST /api/iam/resend-confirm-email)', () => {
    const resendUrl = '/api/iam/resend-confirm-email';

    it('should respond with 400 when body is invalid', async () => {
      const response = await request(app.getHttpServer())
        .post(resendUrl)
        .send({ email: 'not-an-email' });
      const result: ErrorResponse = response.body;

      expect(response.status).toBe(400);
      expect(result.message).toContain('email must be an email');
    });

    it('should respond with 404 when user is not found', async () => {
      const response = await request(app.getHttpServer())
        .post(resendUrl)
        .send({ email: 'nonexistent@example.com' });

      expect(response.status).toBe(404);
      expect(response.body.message).toContain('not found');
    });

    it('should successfully resend confirmation email and generate a new token', async () => {
      const email = `test-${Date.now()}@example.com`;
      const password = 'Password123!@';

      // 1. Register user
      const registerPayload = {
        firstName: 'Test',
        lastName: 'User',
        email,
        password,
      };
      await request(app.getHttpServer())
        .post('/api/iam/register-user')
        .send(registerPayload);

      const userRepository = dataSource.getRepository(UserEntity);
      const confirmationTokenRepository = dataSource.getRepository(
        ConfirmationTokenEntity,
      );

      const user = await userRepository.findOne({ where: { email } });
      expect(user).toBeDefined();
      const initialTokens = await confirmationTokenRepository.find({
        where: { user: { id: user!.id } },
      });
      expect(initialTokens.length).toBe(1);

      // 2. Resend confirmation
      const resendResponse = await request(app.getHttpServer())
        .post(resendUrl)
        .send({ email });

      expect(resendResponse.status).toBe(200);

      // 3. Verify a new token was generated
      const updatedTokens = await confirmationTokenRepository.find({
        where: { user: { id: user!.id } },
      });
      expect(updatedTokens.length).toBe(2);
    });

    it('should respond with 409 when user is already verified', async () => {
      const email = `test-${Date.now()}@example.com`;
      const password = 'Password123!@';

      // 1. Register user
      const registerPayload = {
        firstName: 'Test',
        lastName: 'User',
        email,
        password,
      };
      await request(app.getHttpServer())
        .post('/api/iam/register-user')
        .send(registerPayload);

      // 2. Verify user in DB
      const userRepository = dataSource.getRepository(UserEntity);
      const user = await userRepository.findOne({ where: { email } });
      expect(user).toBeDefined();
      await userRepository.update({ id: user!.id }, { isEmailVerified: true });

      // 3. Attempt resend
      const resendResponse = await request(app.getHttpServer())
        .post(resendUrl)
        .send({ email });

      expect(resendResponse.status).toBe(409);
      expect(resendResponse.body.message).toContain('already confirmed');
    });

    it('should allow confirming the email using the newly resent token', async () => {
      const email = `test-${Date.now()}@example.com`;
      const password = 'Password123!@';

      // 1. Register user
      const registerPayload = {
        firstName: 'Test',
        lastName: 'User',
        email,
        password,
      };
      const regRes = await request(app.getHttpServer())
        .post('/api/iam/register-user')
        .send(registerPayload);
      expect(regRes.status).toBe(201);

      // 2. Resend confirmation
      await request(app.getHttpServer()).post(resendUrl).send({ email });

      // 3. Fetch the latest confirmation token from database
      const userRepository = dataSource.getRepository(UserEntity);
      const confirmationTokenRepository = dataSource.getRepository(
        ConfirmationTokenEntity,
      );

      const user = await userRepository.findOne({ where: { email } });
      expect(user).toBeDefined();
      const tokens = await confirmationTokenRepository.find({
        where: { user: { id: user!.id } },
        order: { createdAt: 'DESC' },
      });
      expect(tokens.length).toBe(2);
      const latestToken = tokens[0];

      // 4. Confirm email using the new token
      const confirmResponse = await request(app.getHttpServer())
        .get('/api/iam/confirm-email')
        .query({ token: latestToken.token });

      expect(confirmResponse.status).toBe(200);

      // 5. Verify user and token state in DB
      const updatedUser = await userRepository.findOne({ where: { email } });
      expect(updatedUser?.isEmailVerified).toBe(true);

      const updatedToken = await confirmationTokenRepository.findOne({
        where: { id: latestToken.id },
      });
      expect(updatedToken?.usedAt).toBeDefined();
      expect(updatedToken?.usedAt).not.toBeNull();
    });
  });
});
