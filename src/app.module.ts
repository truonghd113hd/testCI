import { UserGroupAdminModule } from './modules/admin/user-groups/user-group.admin.module';
import { Module } from '@nestjs/common';
import { TypeormModule } from 'src/modules/typeorm/typeorm.module';
import { CoreModule } from './modules/core/core.module';
import { QueuesModule } from './modules/queue/queue.module';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { UserCredentialModule } from './modules/user-credential/user-credential.module';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { LanguageInterceptor } from './shares/interceptors/language.interceptor';
import { MailModule } from './modules/mail/mail.module';
import { DevicesAdminModule } from './modules/admin/devices/devices.admin.module';
import { UserAdminModule } from './modules/admin/users/user.admin.module';
import { UserOauthProviderModule } from './modules/user-oauth-provider/user-oauth-provider.module';
import { AdminModule } from './modules/admin/admin/admin.module';
import { AuthAdminModule } from './modules/admin/auth/auth.admin.module';
import { DevicesModule } from './modules/devices/devices.module';
import { UserHealthMetricModule } from './modules/user-health-metric/user-health-metric.module';

export const modules = [
  AuthModule,
  MailModule,
  UsersModule,
  UserCredentialModule,
  UserAdminModule,
  DevicesAdminModule,
  UserGroupAdminModule,
  UserOauthProviderModule,
  AdminModule,
  AuthAdminModule,
  DevicesModule,
  UserHealthMetricModule,
];

@Module({
  imports: [CoreModule.register(), QueuesModule, TypeormModule, ...modules],
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useClass: LanguageInterceptor,
    },
  ],
})
export class AppModule {}
