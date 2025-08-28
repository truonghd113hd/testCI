import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/modules/users/entities/users.entity';
import { createPagination, PaginationMetadataHelper } from 'src/shares/pagination/pagination.helper';
import { Repository } from 'typeorm';
import { UserAdminService } from '../users/user.admin.service';
import { CreateUserGroupPayloadDto } from './dto/create-user-group.payload.dto';
import { ListUserGroupsQueryDto } from './dto/list-user-groups.query.dto';
import { ListUserGroupsResponseDto } from './dto/list-user-groups.response.dto';
import { UserGroupsEntity } from './entities/user-groups.entity';
import { AssignUserToGroupPayloadDto } from './dto/assign-user-to-group.payload';
import { UserGroupSortBy } from './user-group.const';

@Injectable()
export class UserGroupAdminService {
  constructor(
    @InjectRepository(UserGroupsEntity)
    private readonly userGroupsRepository: Repository<UserGroupsEntity>,
    private readonly PaginationMetadataHelper: PaginationMetadataHelper,
    private readonly userAdminService: UserAdminService,
  ) {}

  async findAll(query: ListUserGroupsQueryDto): Promise<ListUserGroupsResponseDto> {
    const { page, perPage, name, sortBy, orderBy } = query;
    const pagination = createPagination(page, perPage);

    const qb = this.userGroupsRepository
      .createQueryBuilder('user_groups')
      .leftJoinAndSelect('user_groups.users', 'users');
    if (name) {
      qb.where('user_groups.name ILIKE :name', { name: `%${name}%` });
    }
    qb.groupBy('user_groups.id');

    qb.select('user_groups.id', 'id');
    qb.addSelect('user_groups.name', 'name');
    qb.addSelect('CAST(user_groups.require_point AS INTEGER)', 'require_point');
    qb.addSelect('user_groups.created_at', 'created_at');
    qb.addSelect('user_groups.updated_at', 'updated_at');
    qb.addSelect('CAST(COUNT(users.id) AS INTEGER)', 'total_users');

    qb.offset(pagination.startIndex);
    qb.limit(pagination.perPage);
    qb.orderBy(`user_groups.${sortBy || UserGroupSortBy.REQUIRE_POINT}`, orderBy || 'ASC');

    const [userGroups, total] = await Promise.all([qb.getRawMany(), qb.getCount()]);

    const metadata = this.PaginationMetadataHelper.getMetadata(createPagination(page, perPage), total);
    return {
      data: userGroups,
      metadata,
    };
  }

  async create(payload: CreateUserGroupPayloadDto): Promise<UserGroupsEntity> {
    const userGroup = this.userGroupsRepository.create({
      name: payload.name,
      require_point: payload.require_point,
    });
    return this.userGroupsRepository.save(userGroup);
  }

  async assignUserGroup(payload: AssignUserToGroupPayloadDto): Promise<User> {
    const userGroup = await this.userGroupsRepository.findOne({ where: { id: payload.user_group_id } });
    if (!userGroup) {
      throw new NotFoundException('User group not found');
    }

    return this.userAdminService.assignUserGroup(payload);
  }

  async findByName(name: string): Promise<UserGroupsEntity> {
    const userGroup = await this.userGroupsRepository.findOne({ where: { name } });
    if (!userGroup) {
      throw new NotFoundException('User group not found');
    }
    return userGroup;
  }
}
