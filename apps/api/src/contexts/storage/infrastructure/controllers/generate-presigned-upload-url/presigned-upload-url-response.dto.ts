import { ApiProperty } from '@nestjs/swagger';

export class PresignedUploadUrlResponseDto {
  @ApiProperty({ example: 'https://s3.amazonaws.com/bucket/key?signature=xyz' })
  uploadUrl: string;

  @ApiProperty({ example: 'storage/123e4567-e89b-12d3-a456-426614174000.png' })
  key: string;

  @ApiProperty({ example: 900 })
  expiresInSeconds: number;
}
