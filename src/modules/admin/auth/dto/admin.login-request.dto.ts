import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class AdminLoginRequestDto {
  @ApiProperty({
    type: String,
    description: 'Username of user',
    example: 'user@example.com',
  })
  @IsString()
  @IsNotEmpty()
  email: string;

  @ApiProperty({
    type: String,
    description: 'Password of user',
    example: 'H123456@',
  })
  @IsString()
  @IsNotEmpty()
  password: string;
}
