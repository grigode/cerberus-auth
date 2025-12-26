export interface RecordLoginAttemptInput {
  email: string;
  result: boolean;
  ip: string;
  userAgent: string;
  failureReason?: string;
}
