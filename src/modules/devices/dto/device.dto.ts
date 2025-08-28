import { IsDate, IsNotEmpty, IsNumber, IsObject, IsOptional, IsString } from 'class-validator';
import { DeviceStatus } from '../types/devices.type';
import { ApiProperty } from '@nestjs/swagger';

export class DeviceDto {
  @ApiProperty({
    description: 'Name of the device',
    example: 'Device 1',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    description: 'IMEI of the device',
    example: '1234567890',
  })
  @IsString()
  @IsNotEmpty()
  IMEI: string;

  @ApiProperty({
    description: 'User ID of the device',
    example: '1',
  })
  @IsNumber()
  @IsOptional()
  userId: number;

  @ApiProperty({
    description: 'Status of the device',
    example: DeviceStatus.CONNECTED,
  })
  @IsString()
  @IsNotEmpty()
  status: DeviceStatus;

  @ApiProperty({
    description: 'Serial number of the device',
    example: '1234567890',
  })
  @IsString()
  @IsNotEmpty()
  serialNumber: string;

  @ApiProperty({
    description: 'Last time sync of the device',
    example: new Date(),
  })
  @IsDate()
  @IsNotEmpty()
  lastTimeSync: Date;

  @ApiProperty({
    description: 'Type of the device',
    example: new Date(),
  })
  @IsDate()
  @IsNotEmpty()
  created_at: Date;

  @ApiProperty({
    description: 'Type name of the device',
    example: 'RM01',
  })
  @IsString()
  @IsNotEmpty()
  typeName: string;

  @ApiProperty({
    description: 'Updated at',
    example: new Date(),
  })
  @IsDate()
  @IsNotEmpty()
  updated_at: Date;
}
