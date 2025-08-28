import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserAdminModule } from '../users/user.admin.module';
import { UserGroupsEntity } from './entities/user-groups.entity';
import { UserGroupAdminController } from './user-group.admin.controller';
import { UserGroupAdminService } from './user-group.admin.service';

@Module({
  imports: [TypeOrmModule.forFeature([UserGroupsEntity]), UserAdminModule],
  controllers: [UserGroupAdminController],
  providers: [UserGroupAdminService],
  exports: [UserGroupAdminService],
})
export class UserGroupAdminModule {}
