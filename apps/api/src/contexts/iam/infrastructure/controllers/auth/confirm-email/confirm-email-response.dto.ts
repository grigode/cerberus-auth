import { ApiProperty } from '@nestjs/swagger';

export class ConfirmEmailResponseDto {
  @ApiProperty({ example: 'Email address confirmed successfully' })
  message: string;
}
