import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';
import { DeviceType } from '../types/devices.type';

export class AddDeviceDto {
  @ApiPropertyOptional({
    description: 'Device name',
    example: 'Device 1',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional({
    description: 'Serial number',
    example: '1234567890',
  })
  @IsString()
  @IsNotEmpty()
  serial_number: string;

  @ApiPropertyOptional({
    description: 'Device type',
    example: DeviceType.R20,
    enum: [DeviceType.SY01, DeviceType.R10M, DeviceType.R20],
  })
  @IsString()
  @IsNotEmpty()
  type: DeviceType;

  @ApiPropertyOptional({
    description: 'IMEI',
    example: '1234567890',
  })
  @IsString()
  @IsNotEmpty()
  IMEI: string;
}
