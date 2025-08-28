import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class RefreshTokenRequestDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    type: String,
    description: 'Refresh token',
    example:
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6ImpvaG4iLCJpYXQiOjE2NzkzOTI4NDAsImV4cCI6MTY3OTk5NzY0MH0._Jj0t_m7Vp4awrdlFDoM7bQt4gxvtXC8tSsCQGQFB84',
  })
  refresh_token: string;
}
