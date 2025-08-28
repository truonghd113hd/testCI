import { ApiProperty } from '@nestjs/swagger';
import { PaginationResponseDto } from 'src/shares/pagination/pagination.dto';
import { DevicesTypeDto } from './device-types.dto';
import { IsNotEmpty } from 'class-validator';
import { IsNumber } from 'class-validator';

class DeviceTypeResponseDto extends DevicesTypeDto {
  @ApiProperty({ description: 'Total devices', example: 100 })
  @IsNumber()
  @IsNotEmpty()
  total_connected_devices: number;
}
export class ListDeviceTypesResponseDto extends PaginationResponseDto<DeviceTypeResponseDto> {
  @ApiProperty({
    description: 'Device types',
    type: [DevicesTypeDto],
    example: [
      {
        name: 'RM01',
        bonusPercentage: 10,
        stepsPerPoint: 100,
        created_at: new Date(),
        updated_at: new Date(),
        total_connected_devices: 100,
      },
    ],
  })
  declare data: DeviceTypeResponseDto[];
}
