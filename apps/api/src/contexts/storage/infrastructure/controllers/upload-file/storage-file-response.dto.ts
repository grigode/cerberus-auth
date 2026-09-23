import { ApiProperty } from '@nestjs/swagger';
import type { UploadedFileResult } from '@core/domain';

export class StorageFileResponseDto {
  @ApiProperty({ example: 'documents/report.pdf' })
  key: string;

  @ApiProperty({ example: 'report.pdf' })
  filename: string;

  @ApiProperty({
    example: 'https://s3.amazonaws.com/bucket/documents/report.pdf',
  })
  url: string;

  @ApiProperty({ example: 'application/pdf' })
  mimetype: string;

  @ApiProperty({ example: 1048576 })
  size: number;

  static fromDomain(result: UploadedFileResult): StorageFileResponseDto {
    const dto = new StorageFileResponseDto();
    dto.key = result.key;
    dto.filename = result.filename;
    dto.url = result.url;
    dto.mimetype = result.mimetype;
    dto.size = result.size;
    return dto;
  }
}
