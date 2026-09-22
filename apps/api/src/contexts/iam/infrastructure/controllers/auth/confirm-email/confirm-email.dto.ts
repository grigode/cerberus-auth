import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class ConfirmEmailQueryDto {
  @ApiProperty({
    description: 'Email confirmation token',
    example: 'uuid-confirmation-token-string',
  })
  @IsString()
  @IsNotEmpty()
  token: string;
}
