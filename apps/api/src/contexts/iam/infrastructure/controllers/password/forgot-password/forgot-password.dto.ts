import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsEnum, IsOptional } from 'class-validator';
import { LanguageCode } from '@core/domain';

export class ForgotPasswordDto {
  @ApiProperty({
    example: 'john.doe@example.com',
    description: 'User email address',
  })
  @IsEmail()
  email: string;

  @ApiPropertyOptional({
    enum: LanguageCode,
    example: LanguageCode.EN,
    description: 'Preferred language',
  })
  @IsOptional()
  @IsEnum(LanguageCode)
  language?: LanguageCode;
}
