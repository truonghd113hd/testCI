import { Global, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserCredential } from 'src/modules/user-credential/entities/user-credential.entity';
import { UserGroupsModule } from '../user-groups/user-groups.module';
import { User } from './entities/users.entity';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
@Global()
@Module({
  imports: [TypeOrmModule.forFeature([User, UserCredential]), UserGroupsModule],

  providers: [UsersService],
  exports: [UsersService],
  controllers: [UsersController],
})
export class UsersModule {}
