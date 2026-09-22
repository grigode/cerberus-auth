import type { INestApplication } from '@nestjs/common';
import { getTestingApp, type ErrorResponse } from 'src/common/tests';
import { ConfirmationTokenEntity } from '@core/database';
import { ProfileEntity } from '@core/database';
import { UserEntity } from '@core/database';
import { MAIN_DATA_SOURCE } from '@core/database';
import request from 'supertest';
import type { App } from 'supertest/types';
import type { DataSource } from 'typeorm';

const apiUrl = '/api/iam/register-user';

describe(`Register User (POST ${apiUrl})`, () => {
  let app: INestApplication<App>;

  beforeEach(async () => {
    const { testingApp } = await getTestingApp();
    app = testingApp;
    await app.listen(0);
  });

  describe('should respond with 400 when body is invalid', () => {
    const mostHaveErrorMessage = [
      'firstName must be shorter than or equal to 50 characters',
      'firstName must be longer than or equal to 1 characters',
      'firstName must be a string',
      'lastName must be shorter than or equal to 50 characters',
      'lastName must be longer than or equal to 1 characters',
      'lastName must be a string',
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

    it('with firstName shorter than 1 characters', async () => {
      const response = await request(app.getHttpServer()).post(apiUrl).send({
        firstName: '',
      });
      const result: ErrorResponse = response.body;

      const mostHaveErrorMessage = [
        'firstName must be longer than or equal to 1 characters',
        'lastName must be shorter than or equal to 50 characters',
        'lastName must be longer than or equal to 1 characters',
        'lastName must be a string',
        'email must be an email',
        'password is not strong enough',
      ];

      expect(result.statusCode).toBe(400);
      expect(result.message.length).toBe(mostHaveErrorMessage.length);
      expect(result.message).toEqual(
        expect.arrayContaining(mostHaveErrorMessage),
      );
    });

    it('with firstName longer than 50 characters', async () => {
      const response = await request(app.getHttpServer())
        .post(apiUrl)
        .send({
          firstName: 'a'.repeat(51),
        });
      const result: ErrorResponse = response.body;

      const mostHaveErrorMessage = [
        'firstName must be shorter than or equal to 50 characters',
        'lastName must be shorter than or equal to 50 characters',
        'lastName must be longer than or equal to 1 characters',
        'lastName must be a string',
        'email must be an email',
        'password is not strong enough',
      ];

      expect(result.statusCode).toBe(400);
      expect(result.message.length).toBe(mostHaveErrorMessage.length);
      expect(result.message).toEqual(
        expect.arrayContaining(mostHaveErrorMessage),
      );
    });
    it('with lastName shorter than 1 characters', async () => {
      const response = await request(app.getHttpServer()).post(apiUrl).send({
        lastName: '',
      });
      const result: ErrorResponse = response.body;

      const mostHaveErrorMessage = [
        'firstName must be shorter than or equal to 50 characters',
        'firstName must be longer than or equal to 1 characters',
        'firstName must be a string',
        'lastName must be longer than or equal to 1 characters',
        'email must be an email',
        'password is not strong enough',
      ];

      expect(result.statusCode).toBe(400);
      expect(result.message.length).toBe(mostHaveErrorMessage.length);
      expect(result.message).toEqual(
        expect.arrayContaining(mostHaveErrorMessage),
      );
    });

    it('with lastName longer than 50 characters', async () => {
      const response = await request(app.getHttpServer())
        .post(apiUrl)
        .send({
          lastName: 'a'.repeat(51),
        });
      const result: ErrorResponse = response.body;

      const mostHaveErrorMessage = [
        'firstName must be shorter than or equal to 50 characters',
        'firstName must be longer than or equal to 1 characters',
        'firstName must be a string',
        'lastName must be shorter than or equal to 50 characters',
        'email must be an email',
        'password is not strong enough',
      ];

      expect(result.statusCode).toBe(400);
      expect(result.message.length).toBe(mostHaveErrorMessage.length);
      expect(result.message).toEqual(
        expect.arrayContaining(mostHaveErrorMessage),
      );
    });

    it('with invalid email', async () => {
      const response = await request(app.getHttpServer()).post(apiUrl).send({
        email: 'not-an-email',
      });
      const result: ErrorResponse = response.body;

      const mostHaveErrorMessage = [
        'firstName must be shorter than or equal to 50 characters',
        'firstName must be longer than or equal to 1 characters',
        'firstName must be a string',
        'lastName must be shorter than or equal to 50 characters',
        'lastName must be longer than or equal to 1 characters',
        'lastName must be a string',
        'email must be an email',
        'password is not strong enough',
      ];

      expect(result.statusCode).toBe(400);
      expect(result.message.length).toBe(mostHaveErrorMessage.length);
      expect(result.message).toEqual(
        expect.arrayContaining(mostHaveErrorMessage),
      );
    });

    it('with weak password', async () => {
      const response = await request(app.getHttpServer()).post(apiUrl).send({
        password: 'weak',
      });
      const result: ErrorResponse = response.body;

      const mostHaveErrorMessage = [
        'firstName must be shorter than or equal to 50 characters',
        'firstName must be longer than or equal to 1 characters',
        'firstName must be a string',
        'lastName must be shorter than or equal to 50 characters',
        'lastName must be longer than or equal to 1 characters',
        'lastName must be a string',
        'email must be an email',
        'password is not strong enough',
      ];

      expect(result.statusCode).toBe(400);
      expect(result.message.length).toBe(mostHaveErrorMessage.length);
      expect(result.message).toEqual(
        expect.arrayContaining(mostHaveErrorMessage),
      );
    });
  });

  describe('happy path', () => {
    it('should successfully register a user and save it to the database', async () => {
      const payload = {
        firstName: 'Test',
        lastName: 'User',
        email: `test-${Date.now()}@example.com`,
        password: 'Password123!@',
      };

      const response = await request(app.getHttpServer())
        .post(apiUrl)
        .send(payload);

      expect(response.status).toBe(201);

      const dataSource = app.get<DataSource>(MAIN_DATA_SOURCE);
      const userRepository = dataSource.getRepository(UserEntity);
      const profileRepository = dataSource.getRepository(ProfileEntity);
      const confirmationTokenRepository = dataSource.getRepository(
        ConfirmationTokenEntity,
      );

      const user = await userRepository.findOne({
        where: { email: payload.email },
      });
      expect(user).toBeDefined();
      expect(user?.email).toBe(payload.email);
      expect(user?.isEmailVerified).toBe(false);

      const profile = await profileRepository.findOne({
        where: { userId: user?.id },
      });
      expect(profile).toBeDefined();
      expect(profile?.firstName).toBe(payload.firstName);
      expect(profile?.lastName).toBe(payload.lastName);

      const confirmationToken = await confirmationTokenRepository.findOne({
        where: { user: { id: user?.id } },
      });
      expect(confirmationToken).toBeDefined();
      expect(confirmationToken?.token).toBeDefined();
    });
  });

  describe('conflicts', () => {
    it('should return 409 when the email is already registered', async () => {
      const payload = {
        firstName: 'Test',
        lastName: 'User',
        email: `test-${Date.now()}@example.com`,
        password: 'Password123!@',
      };

      await request(app.getHttpServer()).post(apiUrl).send(payload);

      const response = await request(app.getHttpServer())
        .post(apiUrl)
        .send(payload);

      expect(response.status).toBe(409);
    });
  });

  afterEach(async () => {
    await app.close();
  });
});
