import { BadRequestException, Injectable } from '@nestjs/common';
import { admin } from 'src/firebase-admin';
import { UserCredentialService } from 'src/modules/user-credential/user-credential.service';
import { UserResponseDto } from 'src/modules/users/dtos/user-response.dto';
import { UserStatus } from 'src/modules/users/users.constants';
import { UserOauthProvidersProvider } from '../user-oauth-provider/types/user-oauth-provider.type';
import { UserOauthProviderService } from '../user-oauth-provider/user-oauth-provider.service';
import { UsersService } from '../users/users.service';
import { AuthCommonService } from './auth.common.service';
import { RefreshTokenRequestDto } from './dtos/refresh-token-request.dto';
import { RegisterRequestDto } from './dtos/register-request.dto';
import { User } from '../users/entities/users.entity';
import { ResetPasswordRequestDto } from './dtos/update-password-request.dto';
import { hashString } from '../../shares/helpers/cryptography';
import { USER_TYPE } from './auth.type';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly userCredentialService: UserCredentialService,
    private readonly authCommonService: AuthCommonService,

    private readonly userOauthProviderService: UserOauthProviderService,
  ) {}

  async validateUserWithUsernameAndPassword(email: string, password: string): Promise<User> {
    return this.userCredentialService.getUserWithUsernameAndPassword(email, password);
  }

  async login(user: UserResponseDto) {
    const { access_token, refresh_token } = await this.authCommonService.getTokens({
      id: user.id,
      email: user.email,
    });
    return {
      user: {
        id: user.id,
        email: user.email,
      },
      access_token,
      refresh_token,
    };
  }

  async register(registerRequest: RegisterRequestDto) {
    const user = await this.usersService.addNewUser(registerRequest);
    await this.authCommonService.sendOtp(user.email, USER_TYPE.USER);
    return {
      user: {
        id: user.id,
        email: user.email,
      },
    };
  }

  async sendOtp(email: string): Promise<{ success: boolean; message: string }> {
    const user = await this.usersService.findByEmail(email);
    if (!user) {
      throw new BadRequestException(`Email does not exist`);
    }
    return this.authCommonService.sendOtp(email, USER_TYPE.USER);
  }

  me(userId: number) {
    return this.usersService.getUserById(userId);
  }

  async refreshToken(data: RefreshTokenRequestDto) {
    const user = await this.authCommonService.decodeRefreshToken(data.refresh_token);
    if (!user) {
      throw new BadRequestException(`User not found`);
    }
    return this.authCommonService.getTokens({ id: user.id, email: user.email });
  }

  async checkEmailExists(email: string): Promise<boolean> {
    const user = await this.usersService.findByEmail(email);
    return !!user;
  }

  async checkOtp(
    email: string,
    otp: string,
  ): Promise<
    | {
        user: { id: number; email: string } | null;
        access_token: string;
        refresh_token: string;
      }
    | 'expired'
    | 'invalid'
  > {
    const user = await this.usersService.findByEmail(email);
    if (!user) {
      throw new BadRequestException(`User not found!`);
    }
    const result = await this.authCommonService.checkOtp(otp, { id: user.id, email: user.email }, USER_TYPE.USER);
    await this.usersService.updateUserStatusByEmail(email, UserStatus.ACTIVE);
    return result;
  }

  async loginWithFirebaseIdToken(idToken: string) {
    const decoded = await admin.auth().verifyIdToken(idToken);
    const {
      uid,
      email,
      name,
      picture,
      firebase: { sign_in_provider },
    } = decoded;
    if (!email) {
      throw new BadRequestException('SSO login failed: missing email');
    }
    // Map Firebase provider to enum
    const providerMap = {
      'google.com': UserOauthProvidersProvider.GOOGLE,
      'facebook.com': UserOauthProvidersProvider.FACEBOOK,
      'apple.com': UserOauthProvidersProvider.APPLE,
    };
    const providerEnum = providerMap[sign_in_provider];
    if (!providerEnum) {
      throw new BadRequestException('SSO login failed: unknown provider');
    }
    const oauth = await this.userOauthProviderService.findByProviderUid(providerEnum, uid);
    let user: User;
    if (oauth) {
      user = oauth.user;
    } else {
      const existingUser = await this.usersService.findByEmail(email);

      user = existingUser
        ? existingUser
        : await this.usersService.addNewUser({
            email,
            full_name: name,
            avatar: picture,
            password: `${Math.floor(100000 + Math.random() * 900000)}`,
          });

      await this.userOauthProviderService.createOAuthRecord({
        provider: providerEnum,
        provider_user_id: uid,
        email,
        name,
        avatar: picture,
        id_token: idToken,
        user,
      });
    }

    const { access_token, refresh_token } = await this.authCommonService.getTokens({
      id: user.id,
      email: user.email,
    });
    return {
      user: {
        id: user.id,
        email: user.email,
      },
      access_token,
      refresh_token,
    };
  }

  async resetPassword(email: string, payload: ResetPasswordRequestDto) {
    const user = await this.usersService.findByEmail(email);
    if (!user) {
      throw new BadRequestException(`Email does not exist`);
    }
    const userCredential = await this.userCredentialService.resetPassword(email, payload.newPassword);
    return userCredential.user;
  }
}
