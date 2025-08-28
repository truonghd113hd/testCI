import { Global, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DevicesEntity } from './entities/devices.entity';
import { DevicesService } from './devices.service';
import { DevicesController } from './devices.controller';
import { DeviceTypesEntity } from './entities/devices_type.entity';
import { UserHealthMetric } from '../user-health-metric/entities/user-health-metric.entity';

@Global()
@Module({
  imports: [TypeOrmModule.forFeature([DevicesEntity, DeviceTypesEntity, UserHealthMetric])],
  providers: [DevicesService],
  exports: [],
  controllers: [DevicesController],
})
export class DevicesModule {}
