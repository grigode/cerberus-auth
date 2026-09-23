import { ApiProperty } from '@nestjs/swagger';

export class PresignedDownloadUrlResponseDto {
  @ApiProperty({
    example: 'https://s3.amazonaws.com/bucket/key?signature=xyz',
  })
  downloadUrl: string;
}
