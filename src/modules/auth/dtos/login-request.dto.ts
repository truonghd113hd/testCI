import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { IsNotEmpty, IsString } from 'class-validator';

export class LoginRequestDto {
  @ApiProperty({
    type: String,
    description: 'Username of user',
    example: 'user@example.com',
  })
  @IsString()
  @IsNotEmpty()
  username: string;

  @ApiProperty({
    type: String,
    description: 'Password of user',
    example: 'H123456@',
  })
  @IsString()
  @IsNotEmpty()
  password: string;
}

export class LoginAdminVeriyRequestDto {
  @Expose()
  @IsNotEmpty()
  @ApiProperty({
    type: Number,
    description: 'Id of user',
    example: 1,
  })
  id: number;

  @Expose()
  @IsNotEmpty()
  @ApiProperty({
    type: String,
    description: 'OTP',
    example: '123456',
  })
  otp: string;
}

export class LoginAdminResendOTPRequestDto {
  @Expose()
  @IsNotEmpty()
  @ApiProperty({
    type: Number,
    description: 'Id of user',
    example: 1,
  })
  id: number;
}
