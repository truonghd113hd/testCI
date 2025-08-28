import { Expose } from 'class-transformer';

import { ApiProperty } from '@nestjs/swagger';

@Expose()
export class ForgotPasswordResponseDto {
  @Expose()
  @ApiProperty({
    type: String,
    description: 'Message',
    example: 'OTP sent to email successfully',
  })
  message: string;

  @Expose()
  @ApiProperty({
    type: Boolean,
    description: 'Success',
    example: true,
  })
  success: boolean;
}
