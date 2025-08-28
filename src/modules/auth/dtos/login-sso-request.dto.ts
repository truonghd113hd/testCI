import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class LoginSsoRequestDto {
  @ApiProperty({
    type: String,
    description: 'Id Token response from SSO provider',
    example: 'eyJhbGciOi.....',
  })
  @IsString()
  @IsNotEmpty()
  idToken: string;
}
