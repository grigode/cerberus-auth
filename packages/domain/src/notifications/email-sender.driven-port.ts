export interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export const EMAIL_SENDER_DRIVEN_PORT_TOKEN = Symbol('EmailSenderDrivenPort');

export interface EmailSenderDrivenPort {
  sendEmail(options: SendEmailOptions): Promise<void>;
}
