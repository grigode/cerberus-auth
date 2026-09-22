import type { INestApplication } from '@nestjs/common';
import { getTestingApp } from 'src/common/tests';
import { PasswordResetTokenEntity } from '@core/database';
import { UserEntity } from '@core/database';
import { MAIN_DATA_SOURCE } from '@core/database';
import request from 'supertest';
import type { App } from 'supertest/types';
import type { DataSource } from 'typeorm';

describe('Password Reset Flow (E2E)', () => {
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

  describe('Forgot Password (POST /api/iam/forgot-password)', () => {
    it('should respond with 200 when user does not exist (prevent enumeration)', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/iam/forgot-password')
        .send({ email: 'nonexistent@example.com' });

      expect(response.status).toBe(200);
    });

    it('should respond with 200 and generate reset token when user exists', async () => {
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

      // Verify email so they can login later
      const userRepository = dataSource.getRepository(UserEntity);
      await userRepository.update({ email }, { isEmailVerified: true });

      // 2. Request password reset
      const response = await request(app.getHttpServer())
        .post('/api/iam/forgot-password')
        .send({ email });

      expect(response.status).toBe(200);

      // 3. Verify token exists in database
      const user = await userRepository.findOne({ where: { email } });
      expect(user).toBeDefined();
      const passwordResetTokenRepository = dataSource.getRepository(
        PasswordResetTokenEntity,
      );
      const tokenRecord = await passwordResetTokenRepository.findOne({
        where: { user: { id: user!.id } },
      });
      expect(tokenRecord).toBeDefined();
      expect(tokenRecord?.token).toBeDefined();
      expect(tokenRecord?.usedAt).toBeNull();
    });
  });

  describe('Reset Password (POST /api/iam/reset-password)', () => {
    it('should respond with 400 when body/token is invalid', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/iam/reset-password')
        .send({ token: '', password: 'NewPassword123!@' });

      expect(response.status).toBe(400);
    });

    it('should respond with 400 when password is weak', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/iam/reset-password')
        .send({ token: 'some-token-value-here', password: 'weak' });

      expect(response.status).toBe(400);
      expect(response.body.message).toContain('password is not strong enough');
    });

    it('should successfully reset password, allow logging in with new password, and forbid using same token again', async () => {
      const email = `test-${Date.now()}@example.com`;
      const password = 'Password123!@';
      const newPassword = 'NewPassword123!@';

      // 1. Register and verify
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
      await userRepository.update({ email }, { isEmailVerified: true });

      // 2. Request forgot password
      await request(app.getHttpServer())
        .post('/api/iam/forgot-password')
        .send({ email });

      // 3. Find token in DB
      const user = await userRepository.findOne({ where: { email } });
      expect(user).toBeDefined();
      const passwordResetTokenRepository = dataSource.getRepository(
        PasswordResetTokenEntity,
      );
      const tokenRecord = await passwordResetTokenRepository.findOne({
        where: { user: { id: user!.id } },
      });
      expect(tokenRecord).toBeDefined();
      const token = tokenRecord!.token;

      // 4. Reset password
      const resetResponse = await request(app.getHttpServer())
        .post('/api/iam/reset-password')
        .send({ token, password: newPassword });

      expect(resetResponse.status).toBe(200);

      // 5. Try login with old password -> expect 400 (InvalidCredentialsException)
      const loginOldResponse = await request(app.getHttpServer())
        .post('/api/iam/login')
        .send({ email, password });
      expect(loginOldResponse.status).toBe(400);

      // 6. Try login with new password -> expect 200
      const loginNewResponse = await request(app.getHttpServer())
        .post('/api/iam/login')
        .send({ email, password: newPassword });
      expect(loginNewResponse.status).toBe(200);

      // 7. Try to reuse the same token -> expect 400
      const reuseResponse = await request(app.getHttpServer())
        .post('/api/iam/reset-password')
        .send({ token, password: 'AnotherPassword123!@' });
      expect(reuseResponse.status).toBe(400);
      expect(reuseResponse.body.message).toContain('invalid or expired');
    });

    it('should respond with 403 when user is inactive', async () => {
      const email = `test-${Date.now()}@example.com`;
      const password = 'Password123!@';

      // 1. Register and verify
      await request(app.getHttpServer()).post('/api/iam/register-user').send({
        firstName: 'Test',
        lastName: 'User',
        email,
        password,
      });

      const userRepository = dataSource.getRepository(UserEntity);
      await userRepository.update({ email }, { isEmailVerified: true });

      // 2. Request forgot password
      await request(app.getHttpServer())
        .post('/api/iam/forgot-password')
        .send({ email });

      // 3. Find token in DB and set user to inactive
      const user = await userRepository.findOne({ where: { email } });
      expect(user).toBeDefined();
      await userRepository.update({ id: user!.id }, { isActive: false });

      const passwordResetTokenRepository = dataSource.getRepository(
        PasswordResetTokenEntity,
      );
      const tokenRecord = await passwordResetTokenRepository.findOne({
        where: { user: { id: user!.id } },
      });
      const token = tokenRecord!.token;

      // 4. Reset password -> expect 403
      const resetResponse = await request(app.getHttpServer())
        .post('/api/iam/reset-password')
        .send({ token, password: 'NewPassword123!@' });

      expect(resetResponse.status).toBe(403);
      expect(resetResponse.body.message).toContain('is inactive');
    });
  });
});
