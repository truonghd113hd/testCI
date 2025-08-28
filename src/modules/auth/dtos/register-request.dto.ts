import { ApiProperty } from '@nestjs/swagger';
import { Exclude, Expose } from 'class-transformer';
import { IsEmail, IsOptional, IsString, IsUrl, NotContains } from 'class-validator';

@Exclude()
export class RegisterRequestDto {
  @Expose()
  @IsEmail()
  @ApiProperty({
    type: String,
    description: 'Email of user',
    example: 'john@gmail.com',
  })
  email: string;

  @Expose()
  @ApiProperty({
    type: String,
    description: 'Password of user',
    example: '1',
  })
  @IsString()
  password: string;

  @IsOptional()
  @Expose()
  @ApiProperty({
    type: String,
    description: 'Fullname of user',
    example: 'john nathan',
  })
  @IsString()
  full_name?: string;

  @IsOptional()
  @IsUrl()
  @IsString()
  @Expose()
  @ApiProperty({
    type: String,
    description: 'avatar of user',
    example: 'https://image.url',
  })
  avatar?: string;
}
