import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEmail,
  IsEnum,
  IsOptional,
  IsString,
  IsStrongPassword,
  MaxLength,
  MinLength,
} from 'class-validator';
import { LanguageCode } from '@core/domain';

export class RegisterUserDto {
  @ApiProperty({ example: 'John', description: 'User first name' })
  @IsString()
  @MinLength(1)
  @MaxLength(50)
  firstName: string;

  @ApiProperty({ example: 'Doe', description: 'User last name' })
  @IsString()
  @MinLength(1)
  @MaxLength(50)
  lastName: string;

  @ApiProperty({
    example: 'john.doe@example.com',
    description: 'User email address',
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    example: 'Password123!#',
    description: 'Strong user password',
  })
  @IsStrongPassword({
    minLength: 12,
    minLowercase: 1,
    minNumbers: 1,
    minSymbols: 1,
    minUppercase: 1,
  })
  password: string;

  @ApiPropertyOptional({
    enum: LanguageCode,
    example: LanguageCode.EN,
    description: 'Preferred language',
  })
  @IsOptional()
  @IsEnum(LanguageCode)
  language?: LanguageCode;
}
