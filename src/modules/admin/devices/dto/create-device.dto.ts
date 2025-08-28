import { ApiProperty, OmitType } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber } from 'class-validator';
import { DeviceDto } from 'src/modules/devices/dto/device.dto';

export class CreateDeviceDto extends OmitType(DeviceDto, ['typeName', 'created_at', 'updated_at', 'lastTimeSync']) {
  @ApiProperty({
    description: 'Type ID of the device',
    example: 175458029854655,
  })
  @IsNumber()
  @IsNotEmpty()
  typeId: number;
}
