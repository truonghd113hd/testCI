import { Module } from '@nestjs/common';
import { UserGroupsService } from './user-groups.service';
import { UserGroupsEntity } from '../admin/user-groups/entities/user-groups.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([UserGroupsEntity])],
  controllers: [],
  providers: [UserGroupsService],
  exports: [UserGroupsService],
})
export class UserGroupsModule {}
