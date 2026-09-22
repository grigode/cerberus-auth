import { ApiProperty } from '@nestjs/swagger';

export class ForgotPasswordResponseDto {
  @ApiProperty({
    example: 'If the email is registered, a password reset link has been sent.',
  })
  message: string;
}
