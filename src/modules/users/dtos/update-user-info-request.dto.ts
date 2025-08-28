import { ApiProperty, PartialType, PickType } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { IsNotEmpty, IsOptional, IsEnum, IsNumber, IsString, Min, Max, Matches, IsDateString } from 'class-validator';
import { HeightUnit, UserGender, WeightUnit } from '../users.constants';
import { UserResponseDto } from 'src/modules/users/dtos/user-response.dto';

@Expose()
export class UpdateUserRequestDto extends PartialType(
  PickType(UserResponseDto, ['full_name', 'avatar', 'address', 'gender']),
) {}

@Expose()
export class UpdateUserFirstTimeRequestDto {
  @IsNotEmpty()
  @Expose()
  @ApiProperty({
    type: String,
    name: 'full_name',
    description: 'Full name of user',
  })
  full_name: string;

  @IsNotEmpty()
  @Expose()
  @ApiProperty({
    type: String,
    name: 'password',
    description: 'Full name of user',
  })
  password: string;

  @Expose()
  @IsOptional()
  @ApiProperty({
    type: String,
    name: 'avatar',
    description: 'Avatar of user',
  })
  avatar?: string;
}

export class UpdateMeRequestDto {
  @IsOptional()
  @IsString()
  @ApiProperty({
    example: 'John',
  })
  full_name?: string;

  @IsOptional()
  @IsEnum(UserGender)
  @ApiProperty({
    enum: UserGender,
    example: 'male: 1 | female: 2 | other: 3 | nullable',
  })
  gender?: UserGender;

  @IsOptional()
  @ApiProperty({
    type: String,
    name: 'date_of_birth',
    description: 'Date of birth of user',
    required: false,
    example: '1990-01-01',
  })
  @IsDateString()
  date_of_birth?: string;

  @IsOptional()
  @ApiProperty({
    example: 170,
  })
  height_cm?: number;

  @IsOptional()
  @IsNumber()
  @Min(1.77) // ~1 ft 7.7 in
  @Max(8.86) // ~8 ft 10.3 in
  @ApiProperty({
    type: Number,
    description: 'Height in feet (1.77-8.86)',
    required: false,
    example: 5.5,
  })
  height_ft?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(11.99)
  @ApiProperty({
    type: Number,
    description: 'Height in inches (0-11.99)',
    required: false,
    example: 5.5,
  })
  height_in?: number;

  @IsOptional()
  @IsEnum(HeightUnit)
  @ApiProperty({
    description: 'Height unit (cm or ft/inch)',
    required: false,
    example: 'cm or ft/inch',
  })
  height_unit?: HeightUnit;

  @IsOptional()
  @IsNumber()
  @Min(20)
  @Max(400)
  @ApiProperty({
    example: 70,
    description: 'Weight in kilograms',
  })
  weight_kg?: number;

  @IsOptional()
  @IsNumber()
  @Min(44.1)
  @Max(881.8)
  @ApiProperty({
    example: 150,
  })
  weight_lb?: number;

  @IsOptional()
  @IsEnum(WeightUnit)
  @ApiProperty({
    example: 'kg or lb',
  })
  weight_unit?: WeightUnit;
}
