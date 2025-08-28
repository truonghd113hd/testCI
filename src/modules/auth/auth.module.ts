import { Module } from '@nestjs/common';
import { UserCredentialModule } from 'src/modules/user-credential/user-credential.module';
import { UsersModule } from '../users/users.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtStrategy } from './strategies/jwt.strategy';
import { LocalStrategy } from './strategies/local.strategy';
import { MailModule } from '../mail/mail.module';
import { UserOauthProviderModule } from '../user-oauth-provider/user-oauth-provider.module';
import { AuthCommonService } from './auth.common.service';

@Module({
  imports: [UsersModule, UserCredentialModule, MailModule, UserOauthProviderModule],
  providers: [LocalStrategy, JwtStrategy, AuthService, AuthCommonService],
  controllers: [AuthController],
})
export class AuthModule {}
