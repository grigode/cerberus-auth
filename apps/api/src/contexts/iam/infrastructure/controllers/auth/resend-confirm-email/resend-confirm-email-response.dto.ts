import { ApiProperty } from '@nestjs/swagger';

export class ResendConfirmEmailResponseDto {
  @ApiProperty({
    example: 'If the email is registered, a confirmation link has been sent.',
  })
  message: string;
}
