import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DevicesEntity } from './entities/devices.entity';
import { ListDevicesResponseDto } from './dto/list-devices.response.dto';
import { PaginationMetadataHelper } from '../../shares/pagination/pagination.helper';
import { createPagination } from '../../shares/helpers/utils';
import { ListDevicesQueryDto } from './dto/list-devices.query.dto';
import { PaginationOrderBy } from '../../shares/pagination/pagination.constant';
import { AddDeviceDto } from './dto/add-device.dto';
import { DeviceTypesEntity } from './entities/devices_type.entity';
import { DeviceStatus } from './types/devices.type';
import { UserHealthMetric } from '../user-health-metric/entities/user-health-metric.entity';
import { AddUserHealthMetricDto } from '../user-health-metric/dtos/add-user-health-metric.dto';

@Injectable()
export class DevicesService {
  constructor(
    @InjectRepository(DevicesEntity)
    private devicesRepository: Repository<DevicesEntity>,
    @InjectRepository(DeviceTypesEntity)
    private readonly devicesTypeRepository: Repository<DeviceTypesEntity>,
    @InjectRepository(UserHealthMetric)
    private readonly userHealthMetricRepository: Repository<UserHealthMetric>,
    private readonly paginationMetadataHelper: PaginationMetadataHelper,
  ) {}

  async getDevicesByUserId(userId: number, query: ListDevicesQueryDto): Promise<ListDevicesResponseDto> {
    if (!userId) {
      throw new BadRequestException('User ID is required');
    }
    const { page, perPage, orderBy } = query;

    const pagination = createPagination(page, perPage);

    const queryBuilder = this.devicesRepository
      .createQueryBuilder('devices')
      .leftJoinAndSelect('devices.type', 'device_type')
      .where('devices.user_id = :userId', { userId })
      .select('devices.*')
      .addSelect('device_type.name', 'device_type_name')
      .addSelect('device_type.bonus_percentage', 'device_type_bonus_percentage')
      .addSelect('device_type.steps_per_point', 'device_type_steps_per_point')
      .orderBy('created_at', PaginationOrderBy.DESC);

    queryBuilder.offset(pagination.startIndex);
    queryBuilder.limit(pagination.perPage);

    const data = await queryBuilder.getRawMany();
    const total = await queryBuilder.getCount();

    const metadata = this.paginationMetadataHelper.getMetadata(pagination, total);
    return { data, metadata };
  }

  async addDevice(userId: number, body: AddDeviceDto) {
    const { name, IMEI, serial_number, type } = body;

    const existingDeviceByImei = await this.devicesRepository.findOne({ where: { IMEI } });
    if (existingDeviceByImei) {
      throw new BadRequestException('IMEI already exists');
    }

    const existingDeviceBySerial = await this.devicesRepository.findOne({ where: { serialNumber: serial_number } });
    if (existingDeviceBySerial) {
      throw new BadRequestException('Serial number already exists');
    }

    const deviceType = await this.devicesTypeRepository.findOne({ where: { deviceType: type } });
    if (!deviceType) {
      throw new BadRequestException('Device type not found');
    }

    const device = new DevicesEntity();
    device.name = name;
    device.userId = userId;
    device.IMEI = IMEI;
    device.serialNumber = serial_number;
    device.typeId = deviceType.id;

    return this.devicesRepository.save(device);
  }

  async connectDevice(userId: number, deviceId: number) {
    const device = await this.devicesRepository.findOne({ where: { id: deviceId, userId } });
    if (!device) {
      throw new BadRequestException('Device not found');
    }
    await this.devicesRepository.update({ userId }, { status: DeviceStatus.DISCONNECTED });

    device.status = DeviceStatus.CONNECTED;
    return this.devicesRepository.save(device);
  }

  async syncDeviceData(userId: number, deviceId: number, body: AddUserHealthMetricDto) {
    const device = await this.devicesRepository.findOne({ where: { id: deviceId, userId } });
    if (!device) {
      throw new BadRequestException('Device not found');
    }
    const {
      active_energy,
      body_temperature,
      heart_rate,
      steps,
      cycling_distance,
      running_distance,
      walking_distance,
      weight,
      height,
    } = body;

    const userHealthMetric = new UserHealthMetric();
    userHealthMetric.userId = userId;
    userHealthMetric.deviceId = deviceId;
    userHealthMetric.activeEnergy = active_energy;
    userHealthMetric.bodyTemperature = body_temperature;
    userHealthMetric.heartRate = heart_rate;
    userHealthMetric.steps = steps;
    userHealthMetric.cyclingDistance = cycling_distance;
    userHealthMetric.runningDistance = running_distance;
    userHealthMetric.walkingDistance = walking_distance;
    userHealthMetric.weight = weight;
    userHealthMetric.height = height;

    return this.userHealthMetricRepository.save(userHealthMetric);
  }
}
