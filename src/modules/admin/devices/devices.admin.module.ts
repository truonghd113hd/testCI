import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DevicesEntity } from 'src/modules/devices/entities/devices.entity';
import { DevicesAdminService } from './devices.admin.service';
import { DevicesAdminController } from './devices.admin.controller';
import { DeviceTypesEntity } from 'src/modules/devices/entities/devices_type.entity';
import { UserAdminModule } from '../users/user.admin.module';

@Module({
  imports: [TypeOrmModule.forFeature([DevicesEntity, DeviceTypesEntity]), UserAdminModule],
  controllers: [DevicesAdminController],
  providers: [DevicesAdminService],
  exports: [DevicesAdminService],
})
export class DevicesAdminModule {}
