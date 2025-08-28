import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';
import { PaginationDto } from 'src/shares/pagination/pagination.dto';
import { DeviceStatus } from '../types/devices.type';
import { Transform } from 'class-transformer';

export class ListDevicesQueryDto extends PaginationDto {
  @ApiPropertyOptional({
    description: 'Search by user ID',
    example: 1,
  })
  @IsNumber()
  @IsOptional()
  @Transform(({ value }) => Number(value))
  userId: number;

  @ApiPropertyOptional({
    description: 'Search by name',
    example: 'Device 1',
  })
  @IsString()
  @IsOptional()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional({
    description: 'Search by IMEI',
    example: DeviceStatus.CONNECTED,
    enum: DeviceStatus,
  })
  @IsEnum(DeviceStatus)
  @IsOptional()
  status: DeviceStatus;

  @ApiPropertyOptional({
    description: 'Search by serial number',
    example: '1234567890',
  })
  @IsString()
  @IsOptional()
  serialNumber: string;
}
