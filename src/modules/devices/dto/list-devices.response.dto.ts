import { ApiProperty } from '@nestjs/swagger';
import { DeviceDto } from './device.dto';
import { PaginationResponseDto } from 'src/shares/pagination/pagination.dto';
import { DeviceStatus } from '../types/devices.type';

export class ListDevicesResponseDto extends PaginationResponseDto<DeviceDto> {
  @ApiProperty({
    type: [DeviceDto],
    description: 'Array of devices',
    example: [
      {
        id: 1,
        name: 'Device 1',
        IMEI: '1234567890',
        userId: 1234567890,
        typeId: 12,
        status: DeviceStatus.CONNECTED,
        lastTimeSync: new Date(),
        created_at: new Date(),
        updated_at: new Date(),
        serialNumber: '1234567890',
      },
    ],
  })
  declare data: DeviceDto[];
}
