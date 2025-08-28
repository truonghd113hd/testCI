import { Injectable, NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { UserGroupsEntity } from '../admin/user-groups/entities/user-groups.entity';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class UserGroupsService {
  constructor(
    @InjectRepository(UserGroupsEntity)
    private readonly userGroupsRepository: Repository<UserGroupsEntity>,
  ) {}

  async findByName(name: string): Promise<UserGroupsEntity> {
    const userGroup = await this.userGroupsRepository.findOne({ where: { name } });
    if (!userGroup) {
      throw new NotFoundException('User group not found');
    }
    return userGroup;
  }
}
