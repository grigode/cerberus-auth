export interface GeneratePresignedUploadUrlDto {
  filename: string;
  mimetype: string;
  path?: string;
  expiresInSeconds?: number;
}
