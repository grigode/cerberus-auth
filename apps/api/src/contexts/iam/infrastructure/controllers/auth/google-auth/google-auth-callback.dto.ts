import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class GoogleAuthCallbackQueryDto {
  @ApiProperty({
    description: 'OAuth 2.0 authorization code returned by Google',
  })
  @IsString()
  @IsNotEmpty()
  code: string;

  @ApiProperty({
    description: 'Anti-CSRF state token',
  })
  @IsString()
  @IsNotEmpty()
  state: string;
}
