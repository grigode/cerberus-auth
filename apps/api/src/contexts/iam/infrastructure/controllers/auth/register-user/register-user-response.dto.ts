import { ApiProperty } from '@nestjs/swagger';

export class RegisterUserResponseDto {
  @ApiProperty({ example: 'User account created successfully' })
  message: string;
}
