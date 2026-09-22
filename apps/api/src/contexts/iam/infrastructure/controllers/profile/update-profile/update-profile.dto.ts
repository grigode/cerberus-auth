import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEnum,
  IsOptional,
  IsString,
  IsUrl,
  MaxLength,
  MinLength,
} from 'class-validator';
import { LanguageCode } from '@core/domain';

export class UpdateProfileDto {
  @ApiPropertyOptional({
    example: 'Jonathan',
    description: 'Updated first name',
  })
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(50)
  firstName?: string;

  @ApiPropertyOptional({ example: 'Doe', description: 'Updated last name' })
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(50)
  lastName?: string;

  @ApiPropertyOptional({
    example: 'https://example.com/avatar.jpg',
    description: 'Avatar image URL',
  })
  @IsOptional()
  @IsString()
  @IsUrl()
  @MaxLength(255)
  avatarUrl?: string;

  @ApiPropertyOptional({
    enum: LanguageCode,
    example: LanguageCode.EN,
    description: 'Preferred language',
  })
  @IsOptional()
  @IsEnum(LanguageCode)
  language?: LanguageCode;
}
