import { OmitType } from '@nestjs/swagger';
import { DevicesTypeDto } from './device-types.dto';

export class CreateDeviceTypesDto extends OmitType(DevicesTypeDto, ['created_at', 'updated_at']) {}
