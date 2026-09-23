import type { AppConfigService } from '@core/config';
import {
  EMAIL_SENDER_DRIVEN_PORT_TOKEN,
  type EmailSenderDrivenPort,
  LanguageCode,
  TEMPLATE_RENDERER_DRIVEN_PORT_TOKEN,
  type TemplateRendererDrivenPort,
} from '@core/domain';
import { Inject, type UseCase } from '@core/shared-server';

import type { SendPasswordResetEmailDto } from './send-password-reset-email.dto';

export class SendPasswordResetEmailUseCase
  implements UseCase<SendPasswordResetEmailDto, void>
{
  constructor(
    @Inject(TEMPLATE_RENDERER_DRIVEN_PORT_TOKEN)
    private readonly templateRenderer: TemplateRendererDrivenPort,
    @Inject(EMAIL_SENDER_DRIVEN_PORT_TOKEN)
    private readonly emailSender: EmailSenderDrivenPort,
    private readonly appConfig: AppConfigService,
  ) {}

  async execute(dto: SendPasswordResetEmailDto): Promise<void> {
    const resetLink = `${this.appConfig.FRONTEND_URL}/api/auth/reset-password?token=${dto.token}`;
    const html = await this.templateRenderer.render(
      'password-reset',
      dto.language ?? LanguageCode.EN,
      {
        name: dto.name,
        resetLink,
      },
    );

    const subject =
      dto.language === LanguageCode.ES
        ? 'Restablecimiento de contraseña'
        : 'Password Reset Request';

    await this.emailSender.sendEmail({
      to: dto.to,
      subject,
      html,
    });
  }
}
