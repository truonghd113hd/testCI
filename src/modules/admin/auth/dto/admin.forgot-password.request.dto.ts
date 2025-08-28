import { Expose } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty } from 'class-validator';

@Expose()
export class ForgotPasswordRequestDto {
  @Expose()
  @ApiProperty({
    type: String,
    description: 'Email',
    example: 'admin@example.com',
  })
  @IsNotEmpty()
  @IsEmail()
  email: string;
}
