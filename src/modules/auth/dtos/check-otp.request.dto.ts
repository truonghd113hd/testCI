import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString } from 'class-validator';

export class CheckOtpRequestDto {
  @ApiProperty({ description: 'User email', example: 'admin@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ description: 'OTP', example: '123456' })
  @IsString()
  otp: string;
}
