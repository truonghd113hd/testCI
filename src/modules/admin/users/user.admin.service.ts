import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeviceStatus } from 'src/modules/devices/types/devices.type';
import { User } from 'src/modules/users/entities/users.entity';
import { createPagination, PaginationMetadataHelper } from 'src/shares/pagination/pagination.helper';
import { Repository } from 'typeorm';
import { ListUserQueryDto } from './dto/list-user.query.dto';
import { ListUserResponseDto } from './dto/list-user.response.dto';
import { AssignUserToGroupPayloadDto } from '../user-groups/dto/assign-user-to-group.payload';
import { UserSortBy } from 'src/modules/users/users.constants';
import { PaginationOrderBy } from 'src/shares/pagination/pagination.constant';

@Injectable()
export class UserAdminService {
  constructor(
    @InjectRepository(User) private userRepository: Repository<User>,
    private readonly PaginationMetadataHelper: PaginationMetadataHelper,
  ) {}

  async findAll(query: ListUserQueryDto): Promise<ListUserResponseDto> {
    const { page, perPage, search, filters, orderBy, sortBy } = query;

    // Add null safety check for filter
    const { user_group_name, device_name, device_serial_number, gender, status } = filters || {};

    const pagination = createPagination(page, perPage);

    const qb = this.userRepository.createQueryBuilder('user');
    qb.leftJoinAndSelect('user.userGroup', 'userGroup', 'userGroup.id = user.user_group_id');
    qb.leftJoinAndSelect('user.coinSetting', 'coinSetting', 'coinSetting.user_id = user.id');
    qb.leftJoinAndSelect('user.devices', 'devices', 'devices.user_id = user.id AND devices.status = :deviceStatus', {
      deviceStatus: DeviceStatus.CONNECTED,
    });
    qb.leftJoinAndSelect('devices.type', 'deviceType', 'deviceType.id = devices.type_id');

    if (search) {
      qb.where('user.email LIKE :search OR user.full_name LIKE :search', { search: `%${search}%` });
    }

    if (status) {
      qb.andWhere('user.status = :status', { status });
    }

    if (gender) {
      qb.andWhere('user.gender = :gender', { gender });
    }

    if (user_group_name) {
      qb.andWhere('userGroup.name LIKE :user_group_name', { user_group_name: `%${user_group_name}%` });
    }

    if (device_name) {
      qb.andWhere('devices.name LIKE :device_name', { device_name: `%${device_name}%` });
    }

    if (device_serial_number) {
      qb.andWhere('devices.serial_number LIKE :device_serial_number', {
        device_serial_number: `%${device_serial_number}%`,
      });
    }

    qb.limit(pagination.perPage);
    qb.offset(pagination.startIndex);

    qb.select([
      'user.id id',
      'user.email email',
      'user.status status',
      'user.gender gender',
      'user.full_name full_name',
      'user.created_at created_at',
      'userGroup.name user_group_name',
      'user.user_group_id user_group_id',
      'CAST(user.coin AS FLOAT) coin',
      'CAST(user.point AS INTEGER) point',
      'devices.id device_id',
      'devices.name device_name',
      'devices.serial_number device_serial_number',
      'devices.type_id device_type_id',
      'deviceType.name device_type_name',
    ]);

    switch (sortBy) {
      case UserSortBy.CREATED_AT:
        qb.orderBy('user.created_at', orderBy || 'DESC');
        break;
      case UserSortBy.DEVICE_NAME:
        qb.orderBy('devices.name', orderBy || 'DESC');
        break;
      case UserSortBy.USER_GROUP_NAME:
        qb.orderBy('userGroup.name', orderBy || 'DESC');
        break;
      default:
        qb.orderBy('user.created_at', orderBy || 'DESC');
        break;
    }

    const users = await qb.getRawMany();
    const total = await qb.getCount();

    const metadata = this.PaginationMetadataHelper.getMetadata(createPagination(page, perPage), total);
    return {
      data: users,
      metadata,
    };
  }

  async assignUserGroup(payload: AssignUserToGroupPayloadDto): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id: payload.user_id } });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    user.user_group_id = payload.user_group_id;
    return this.userRepository.save(user);
  }

  async findById(id: number): Promise<User> {
    return this.userRepository.findOne({ where: { id } });
  }
}
