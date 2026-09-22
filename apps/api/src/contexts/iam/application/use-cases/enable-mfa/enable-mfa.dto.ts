export interface EnableMfaDto {
  userId: string;
  secret: string;
  code: string;
}
