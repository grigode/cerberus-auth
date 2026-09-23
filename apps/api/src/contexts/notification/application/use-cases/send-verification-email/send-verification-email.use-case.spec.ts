import { LanguageCode } from '@core/domain';
import { SendVerificationEmailUseCase } from './send-verification-email.use-case';

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

describe('SendVerificationEmailUseCase', () => {
  let useCase: SendVerificationEmailUseCase;

  beforeEach(() => {
    jest.clearAllMocks();
    useCase = new SendVerificationEmailUseCase(
      mockTemplateRenderer,
      mockEmailSender,
      mockAppConfig as any,
    );
  });

  it('should render template in Spanish and send verification email', async () => {
    mockTemplateRenderer.render.mockResolvedValue('<html>HTML Body</html>');
    mockEmailSender.sendEmail.mockResolvedValue(undefined);

    await useCase.execute({
      to: 'user@example.com',
      name: 'Carlos',
      token: 'verification-token-123',
      language: LanguageCode.ES,
    });

    expect(mockTemplateRenderer.render).toHaveBeenCalledWith(
      'verification-email',
      LanguageCode.ES,
      {
        name: 'Carlos',
        confirmationLink:
          'http://localhost:8000/api/auth/confirm-email?token=verification-token-123',
      },
    );

    expect(mockEmailSender.sendEmail).toHaveBeenCalledWith({
      to: 'user@example.com',
      subject: 'Confirma tu correo electrónico',
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
      'verification-email',
      LanguageCode.EN,
      {
        name: 'John',
        confirmationLink:
          'http://localhost:8000/api/auth/confirm-email?token=token-456',
      },
    );

    expect(mockEmailSender.sendEmail).toHaveBeenCalledWith({
      to: 'user@example.com',
      subject: 'Confirm your email address',
      html: '<html>English Body</html>',
    });
  });
});
