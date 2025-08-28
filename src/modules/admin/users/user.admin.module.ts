import { Module } from '@nestjs/common';
import { UserAdminController } from './user.admin.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/modules/users/entities/users.entity';
import { UserAdminService } from './user.admin.service';

@Module({
  controllers: [UserAdminController],
  providers: [UserAdminService],
  imports: [TypeOrmModule.forFeature([User])],
  exports: [UserAdminService],
})
export class UserAdminModule {}
