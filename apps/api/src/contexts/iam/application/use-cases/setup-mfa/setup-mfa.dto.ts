export interface SetupMfaDto {
  userId: string;
  appName?: string;
}

export interface SetupMfaResponse {
  secret: string;
  qrCodeUrl: string;
}
