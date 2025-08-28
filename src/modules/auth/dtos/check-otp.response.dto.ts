import { ApiProperty } from '@nestjs/swagger';

class CheckOtpUserDto {
  @ApiProperty({ description: 'User ID', example: 1 })
  id: number;

  @ApiProperty({ description: 'User email', example: 'admin@example.com' })
  email: string;
}
export class CheckOtpResponseDto {
  @ApiProperty({ description: 'User', type: CheckOtpUserDto })
  user: CheckOtpUserDto;

  @ApiProperty({ description: 'Access token', example: 'access_token' })
  access_token: string;

  @ApiProperty({ description: 'Refresh token', example: 'refresh_token' })
  refresh_token: string;
}
