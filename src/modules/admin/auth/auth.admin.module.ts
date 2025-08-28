import { Module } from '@nestjs/common';
import { AuthCommonService } from 'src/modules/auth/auth.common.service';
import { AdminModule } from '../admin/admin.module';
import { AuthAdminController } from './auth.admin.controller';
import { AuthAdminService } from './auth.admin.service';
import { AdminJwtStrategy } from './strategies/admin.jwt.strategy';
import { AdminLocalStrategy } from './strategies/admin.local.strategy';

@Module({
  imports: [AdminModule],
  controllers: [AuthAdminController],
  providers: [AuthAdminService, AuthCommonService, AdminJwtStrategy, AdminLocalStrategy],
})
export class AuthAdminModule {}
