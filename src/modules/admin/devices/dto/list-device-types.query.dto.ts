import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { PaginationDto } from 'src/shares/pagination/pagination.dto';
import { DEVICE_TYPES_SORT_BY_FIELD } from '../devices.const';

export class ListDeviceTypesQueryDto extends PaginationDto {
  @ApiPropertyOptional({ description: 'Example keyword', example: 'RM01' })
  @IsString()
  @IsOptional()
  search: string;

  @ApiPropertyOptional({
    description: 'Device type sort by',
    example: DEVICE_TYPES_SORT_BY_FIELD.NAME,
    enum: DEVICE_TYPES_SORT_BY_FIELD,
  })
  @IsEnum(DEVICE_TYPES_SORT_BY_FIELD)
  @IsOptional()
  sortBy: DEVICE_TYPES_SORT_BY_FIELD;
}
