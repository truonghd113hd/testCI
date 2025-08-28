import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Exclude, Expose } from 'class-transformer';
import { IsOptional } from 'class-validator';
import { UserGender, UserStatus } from 'src/modules/users/users.constants';
import { PaginationDto } from 'src/shares/pagination/pagination.dto';
import { Transform } from 'class-transformer';
import dayjs from 'dayjs';

@Exclude()
export class UserResponseDto {
  @Expose()
  @ApiProperty({
    type: Number,
    name: 'id',
    description: 'Id of user in db',
  })
  id: number;

  @Expose()
  @ApiProperty({
    type: String,
    name: 'email',
    description: 'Username of user',
  })
  email: string;

  @Expose()
  @ApiProperty({
    name: 'status',
  })
  status: UserStatus;

  @Expose()
  @ApiProperty({
    type: String,
    name: 'full_name',
    description: 'Full name of user',
  })
  full_name: string;

  @Expose()
  @ApiProperty({
    type: String,
    name: 'address',
    description: 'Address of user',
  })
  address: string;

  @Expose()
  @ApiProperty({
    type: String,
    name: 'avatar',
    description: 'Address of user',
  })
  avatar: string;

  @Expose()
  @ApiProperty({
    name: 'gender',
  })
  gender: UserGender;

  @Expose()
  @ApiProperty({
    name: 'date_of_birth',
  })
  @Transform(({ value }) => (value ? dayjs(value).format('YYYY-MM-DD') : null))
  date_of_birth: string | null;

  @Expose()
  @ApiProperty({
    type: Number,
    name: 'height_cm',
  })
  height_cm: number | null;

  @Expose()
  @ApiProperty({
    type: Number,
    name: 'height_ft',
    description: 'Height in feet',
  })
  height_ft: number | null;

  @Expose()
  @ApiProperty({
    type: Number,
    name: 'height_in',
    description: 'Height in inches',
  })
  height_in: number | null;

  @Expose()
  @ApiProperty({
    type: String,
    name: 'height_unit',
    description: 'Height unit: cm | ft/in',
    enum: ['cm', 'ft/in'],
  })
  height_unit: 'cm' | 'ft/in' | null;

  @Expose()
  @ApiProperty({
    type: Number,
    name: 'weight_kg',
    description: 'Weight in kilograms',
  })
  weight_kg: number | null;

  @Expose()
  @ApiProperty({
    type: Number,
    name: 'weight_lb',
    description: 'Weight in pounds',
  })
  weight_lb: number | null;

  @Expose()
  @ApiProperty({
    type: String,
    name: 'weight_unit',
    description: 'Weight unit: kg | lb',
    enum: ['kg', 'lb'],
  })
  weight_unit: 'kg' | 'lb' | null;
}

export class AdminIndexUser extends PaginationDto {
  @IsOptional()
  @ApiPropertyOptional({
    type: String,
    description: 'Search email',
    example: 'john@gmail.com',
  })
  email?: string;

  @IsOptional()
  @ApiPropertyOptional({
    type: Number,
    enum: UserStatus,
    description: 'Search status',
    example: UserStatus.ACTIVE,
  })
  status?: UserStatus;
}
