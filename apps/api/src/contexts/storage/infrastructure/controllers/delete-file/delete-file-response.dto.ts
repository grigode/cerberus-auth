import { ApiProperty } from '@nestjs/swagger';

export class DeleteFileResponseDto {
  @ApiProperty({ example: 'File deleted successfully' })
  message: string;
}
