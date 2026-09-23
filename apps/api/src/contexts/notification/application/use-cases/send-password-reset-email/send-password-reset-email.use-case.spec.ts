import { LanguageCode } from '@core/domain';
import { SendPasswordResetEmailUseCase } from './send-password-reset-email.use-case';

const mockTemplateRenderer = {
  render: jest.fn(),
};

const mockEmailSender = {
  sendEmail: jest.fn(),
};

const mockAppConfig = {
  FRONTEND_URL: 'http://localhost:8000',
  APP_NAME: 'Cerberus',
};

describe('SendPasswordResetEmailUseCase', () => {
  let useCase: SendPasswordResetEmailUseCase;

  beforeEach(() => {
    jest.clearAllMocks();
    useCase = new SendPasswordResetEmailUseCase(
      mockTemplateRenderer,
      mockEmailSender,
      mockAppConfig as any,
    );
  });

  it('should render template in Spanish and send password reset email', async () => {
    mockTemplateRenderer.render.mockResolvedValue('<html>HTML Body</html>');
    mockEmailSender.sendEmail.mockResolvedValue(undefined);

    await useCase.execute({
      to: 'user@example.com',
      name: 'Carlos',
      token: 'reset-token-123',
      language: LanguageCode.ES,
    });

    expect(mockTemplateRenderer.render).toHaveBeenCalledWith(
      'password-reset',
      LanguageCode.ES,
      {
        name: 'Carlos',
        resetLink:
          'http://localhost:8000/api/auth/reset-password?token=reset-token-123',
      },
    );

    expect(mockEmailSender.sendEmail).toHaveBeenCalledWith({
      to: 'user@example.com',
      subject: 'Restablecimiento de contraseña',
      html: '<html>HTML Body</html>',
    });
  });

  it('should render template in English when requested', async () => {
    mockTemplateRenderer.render.mockResolvedValue('<html>English Body</html>');
    mockEmailSender.sendEmail.mockResolvedValue(undefined);

    await useCase.execute({
      to: 'user@example.com',
      name: 'John',
      token: 'token-456',
      language: LanguageCode.EN,
    });

    expect(mockTemplateRenderer.render).toHaveBeenCalledWith(
      'password-reset',
      LanguageCode.EN,
      {
        name: 'John',
        resetLink:
          'http://localhost:8000/api/auth/reset-password?token=token-456',
      },
    );

    expect(mockEmailSender.sendEmail).toHaveBeenCalledWith({
      to: 'user@example.com',
      subject: 'Password Reset Request',
      html: '<html>English Body</html>',
    });
  });
});
