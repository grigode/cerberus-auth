export interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export interface EmailSenderDrivenPort {
  sendEmail(options: SendEmailOptions): Promise<void>;
}
