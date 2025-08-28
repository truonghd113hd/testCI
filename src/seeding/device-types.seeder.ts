import { BaseSeeder } from './base.seeder';
import { DeviceTypesEntity } from '../modules/devices/entities/devices_type.entity';
import { DeviceType, DeviceTypeName } from '../modules/devices/types/devices.type';

export class DeviceTypesSeeder extends BaseSeeder {
  protected async seed() {
    this.logger.debug('DeviceTypesSeeder seed [START]');

    const deviceTypeData = [
      {
        name: DeviceTypeName.NoRing,
        bonusPercentage: 80,
        stepsPerPoint: 1000,
        deviceType: DeviceType.NoRing,
      },
      {
        name: DeviceTypeName.SY01,
        bonusPercentage: 100,
        stepsPerPoint: 1000,
        deviceType: DeviceType.SY01,
      },
      {
        name: DeviceTypeName.R10M,
        bonusPercentage: 120,
        stepsPerPoint: 1000,
        deviceType: DeviceType.R10M,
      },
      {
        name: DeviceTypeName.R20,
        bonusPercentage: 150,
        stepsPerPoint: 1000,
        deviceType: DeviceType.R20,
      },
    ];

    for (const data of deviceTypeData) {
      const existingDeviceType = await this.queryRunner.manager.findOne(DeviceTypesEntity, {
        where: { name: data.name },
      });

      if (!existingDeviceType) {
        const deviceType = this.queryRunner.manager.create(DeviceTypesEntity, data);
        await this.queryRunner.manager.save(deviceType);
        this.logger.debug(`Created device type: ${data.name}`);
      } else {
        this.logger.debug(`Device type already exists: ${data.name}`);
      }
    }

    this.logger.debug('DeviceTypesSeeder seed [DONE]');
  }

  protected async clear() {
    this.logger.debug('DeviceTypesSeeder clear [START]');

    // Xóa tất cả device types
    await this.queryRunner.manager.delete(DeviceTypesEntity, {});

    this.logger.debug('DeviceTypesSeeder clear [DONE]');
  }
}

export const seeder = new DeviceTypesSeeder();
