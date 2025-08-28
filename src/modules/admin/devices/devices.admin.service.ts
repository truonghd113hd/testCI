import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DevicesEntity } from 'src/modules/devices/entities/devices.entity';
import { DeviceTypesEntity } from 'src/modules/devices/entities/devices_type.entity';
import { DeviceStatus } from 'src/modules/devices/types/devices.type';
import { createPagination } from 'src/shares/helpers/utils';
import { PaginationOrderBy } from 'src/shares/pagination/pagination.constant';
import { PaginationMetadataHelper } from 'src/shares/pagination/pagination.helper';
import { Repository } from 'typeorm';
import { DEVICE_TYPES_SORT_BY_FIELD } from './devices.const';
import { ListDeviceTypesQueryDto } from './dto/list-device-types.query.dto';
import { ListDeviceTypesResponseDto } from './dto/list-dvice-types.response.dto';
import { DevicesTypeDto } from './dto/device-types.dto';
import { CreateDeviceTypesDto } from './dto/create-device-types.dto';
import { UpdateDeviceTypesDto } from './dto/update-device-types.dto';
import { DeviceDto } from 'src/modules/devices/dto/device.dto';
import { CreateDeviceDto } from './dto/create-device.dto';
import { UserAdminService } from '../users/user.admin.service';

@Injectable()
export class DevicesAdminService {
  constructor(
    @InjectRepository(DeviceTypesEntity)
    private readonly devicesTypeRepository: Repository<DeviceTypesEntity>,
    @InjectRepository(DevicesEntity)
    private readonly devicesRepository: Repository<DevicesEntity>,
    private readonly paginationMetadataHelper: PaginationMetadataHelper,
    private readonly userAdminService: UserAdminService,
  ) {}

  async findAll(query: ListDeviceTypesQueryDto): Promise<ListDeviceTypesResponseDto> {
    const { page, perPage, search, sortBy, orderBy } = query;

    const pagination = createPagination(page, perPage);

    const qb = this.devicesTypeRepository
      .createQueryBuilder('device_types')
      .leftJoinAndMapMany(
        'device_types.devices',
        DevicesEntity,
        'devices',
        'devices.type_id = device_types.id and devices.status = :status',
        { status: DeviceStatus.CONNECTED },
      )
      .groupBy('device_types.id')
      .select('device_types.id', 'id')
      .addSelect('device_types.name', 'name')
      .addSelect('device_types.bonus_percentage', 'bonus_percentage')
      .addSelect('device_types.steps_per_point', 'steps_per_point')
      .addSelect('CAST(COUNT(devices.id) AS INTEGER)', 'total_connected_devices')
      .addSelect('device_types.created_at', 'created_at')
      .addSelect('device_types.updated_at', 'updated_at');

    if (search) {
      qb.where('device_types.name ILIKE :search', { search: `%${search}%` });
    }

    qb.orderBy(`device_types.${sortBy || DEVICE_TYPES_SORT_BY_FIELD.CREATED_AT}`, orderBy || PaginationOrderBy.ASC);
    qb.skip(pagination.startIndex);
    qb.take(pagination.perPage);

    const data = await qb.getRawMany();
    const total = await qb.getCount();

    const metadata = this.paginationMetadataHelper.getMetadata(pagination, total);
    return { data, metadata };
  }

  async createDeviceType(payload: CreateDeviceTypesDto): Promise<DevicesTypeDto> {
    const deviceType = this.devicesTypeRepository.create(payload);
    return this.devicesTypeRepository.save(deviceType);
  }

  async updateDeviceType(id: number, payload: UpdateDeviceTypesDto): Promise<DevicesTypeDto> {
    const deviceType = await this.devicesTypeRepository.findOne({ where: { id } });
    if (!deviceType) {
      throw new NotFoundException('Device type not found');
    }
    return this.devicesTypeRepository.save({ ...deviceType, ...payload });
  }

  async createDevice(payload: CreateDeviceDto): Promise<DeviceDto> {
    const deviceType = await this.devicesTypeRepository.findOne({ where: { id: payload.typeId } });
    if (!deviceType) {
      throw new NotFoundException('Device type not found');
    }

    const existingDevice = await this.devicesRepository.findOne({ where: { IMEI: payload.IMEI } });
    if (existingDevice) {
      throw new BadRequestException('Device already exists');
    }

    if (payload.userId) {
      const user = await this.userAdminService.findById(payload.userId);
      if (!user) {
        throw new NotFoundException('User not found');
      }

      const existingConnectedDevice = await this.devicesRepository.findOne({
        where: { userId: payload.userId, status: DeviceStatus.CONNECTED },
      });
      if (existingConnectedDevice) {
        throw new BadRequestException('User already has a connected device');
      }
    }

    const device = this.devicesRepository.create({
      ...payload,
      status: DeviceStatus.CONNECTED,
    });
    const savedDevice = await this.devicesRepository.save(device);

    return {
      ...savedDevice,
      typeName: deviceType.name,
    };
  }
}
