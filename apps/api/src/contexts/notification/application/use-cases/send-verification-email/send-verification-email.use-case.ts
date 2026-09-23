import type { AppConfigService } from '@core/config';
import {
  EMAIL_SENDER_DRIVEN_PORT_TOKEN,
  type EmailSenderDrivenPort,
  LanguageCode,
  TEMPLATE_RENDERER_DRIVEN_PORT_TOKEN,
  type TemplateRendererDrivenPort,
} from '@core/domain';
import { Inject, type UseCase } from '@core/shared-server';

import type { SendVerificationEmailDto } from './send-verification-email.dto';

export class SendVerificationEmailUseCase
  implements UseCase<SendVerificationEmailDto, void>
{
  constructor(
    @Inject(TEMPLATE_RENDERER_DRIVEN_PORT_TOKEN)
    private readonly templateRenderer: TemplateRendererDrivenPort,
    @Inject(EMAIL_SENDER_DRIVEN_PORT_TOKEN)
    private readonly emailSender: EmailSenderDrivenPort,
    private readonly appConfig: AppConfigService,
  ) {}

  async execute(dto: SendVerificationEmailDto): Promise<void> {
    const confirmationLink = `${this.appConfig.FRONTEND_URL}/api/auth/confirm-email?token=${dto.token}`;
    const html = await this.templateRenderer.render(
      'verification-email',
      dto.language ?? LanguageCode.EN,
      {
        name: dto.name,
        confirmationLink,
      },
    );

    const subject =
      dto.language === LanguageCode.ES
        ? 'Confirma tu correo electrónico'
        : 'Confirm your email address';

    await this.emailSender.sendEmail({
      to: dto.to,
      subject,
      html,
    });
  }
}
