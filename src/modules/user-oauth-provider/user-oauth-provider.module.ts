import { Global, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserOAuthProvider } from './entities/user-oauth-provider.entity';
import { UserOauthProviderService } from './user-oauth-provider.service';

@Global()
@Module({
  imports: [TypeOrmModule.forFeature([UserOAuthProvider])],
  providers: [UserOauthProviderService],
  exports: [UserOauthProviderService],
})
export class UserOauthProviderModule {}
