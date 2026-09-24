import { Injectable, Logger } from '@nestjs/common';
import { MailConfigService } from '@core/config';
import type { EmailSenderDrivenPort, SendEmailOptions } from '@core/domain';
import * as nodemailer from 'nodemailer';

@Injectable()
export class NodemailerAdapter implements EmailSenderDrivenPort {
  private readonly logger = new Logger(NodemailerAdapter.name);
  private readonly transporter: nodemailer.Transporter;

  constructor(private readonly mailConfig: MailConfigService) {
    this.transporter = nodemailer.createTransport({
      host: this.mailConfig.host,
      port: this.mailConfig.port,
      secure: this.mailConfig.secure,
      auth: this.mailConfig.user
        ? {
            user: this.mailConfig.user,
            pass: this.mailConfig.pass,
          }
        : undefined,
    });
  }

  async sendEmail(options: SendEmailOptions): Promise<void> {
    try {
      const mailOptions: nodemailer.SendMailOptions = {
        from: this.mailConfig.from,
        to: options.to,
        subject: options.subject,
        html: options.html,
        text: options.text,
      };

      const info: unknown = await this.transporter.sendMail(mailOptions);
      const messageId =
        typeof info === 'object' && info !== null && 'messageId' in info
          ? String((info as { messageId: unknown }).messageId)
          : 'unknown';

      this.logger.log(
        `Email sent successfully to ${options.to}. MessageId: ${messageId}`,
      );
    } catch (error) {
      const err = error as Error;
      this.logger.error(
        `Error sending email to ${options.to}: ${err.message}`,
        err.stack,
      );
      throw error;
    }
  }
}
