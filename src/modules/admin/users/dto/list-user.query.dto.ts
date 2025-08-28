import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsEnum, IsObject, IsOptional, IsString, ValidateNested } from 'class-validator';
import { UserGender, UserSortBy, UserStatus } from 'src/modules/users/users.constants';
import { getEnumValues } from 'src/shares/helpers/utils';
import { PaginationDto } from 'src/shares/pagination/pagination.dto';

export class FilterUserQueryDto {
  @ApiPropertyOptional({
    description: 'The user group name of the user',
    example: 'Group 1',
  })
  @IsOptional()
  @IsString()
  user_group_name?: string;

  @ApiPropertyOptional({
    description: 'The device name of the user',
    example: 'Device 1',
  })
  @IsOptional()
  @IsString()
  device_name?: string;

  @ApiPropertyOptional({
    description: 'The device serial number of the user',
    example: '1234567890',
  })
  @IsOptional()
  @IsString()
  device_serial_number?: string;

  @ApiPropertyOptional({
    description: 'The gender of the user',
    example: UserGender.MALE,
    enum: getEnumValues(UserGender),
  })
  @IsOptional()
  @IsEnum(UserGender)
  gender?: UserGender;

  @ApiPropertyOptional({
    description: 'The status of the user',
    example: UserStatus.ACTIVE,
    enum: getEnumValues(UserStatus),
  })
  @IsOptional()
  @IsEnum(UserStatus)
  status?: UserStatus;
}

export class ListUserQueryDto extends PaginationDto {
  @ApiPropertyOptional({
    description: 'The search of the user email or name',
    example: 'Example keyword',
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({
    description: 'The sort by',
    example: UserSortBy.CREATED_AT,
    enum: getEnumValues(UserSortBy),
  })
  @IsOptional()
  @IsEnum(UserSortBy)
  sortBy?: UserSortBy;

  @ApiPropertyOptional({
    description: 'The filters',
    type: FilterUserQueryDto,
  })
  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => FilterUserQueryDto)
  filters?: FilterUserQueryDto;
}
