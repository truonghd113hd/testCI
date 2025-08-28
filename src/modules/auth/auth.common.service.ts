import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Cache } from 'cache-manager';
import { CacheService } from '../core/cache.service';
import { ConfigService } from '../core/config.service';
import { MailService } from '../mail/mail.service';
import { JwtPayload, USER_TYPE } from './auth.type';

@Injectable()
export class AuthCommonService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly mailService: MailService,
    @Inject(CACHE_MANAGER) private readonly cacheManger: Cache,
    private readonly cacheService: CacheService,
  ) {}

  async login(user: JwtPayload) {
    const payload = { id: user.id, email: user.email };
    const { access_token, refresh_token } = await this.getTokens(payload);
    return {
      user,
      access_token,
      refresh_token,
    };
  }

  async sendOtp(email: string, userType: USER_TYPE): Promise<{ success: boolean; message: string }> {
    try {
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      await this.cacheManger.set(this.cacheService.getRegisterOTPKey(email, userType), otp, 180);
      await this.mailService.sendRegisterOtpEmail({
        email,
        code: otp,
        expiryTime: 3,
      });
      return {
        success: true,
        message: 'OTP sent to email successfully',
      };
    } catch (error) {
      console.log('error', error);
      return {
        success: false,
        message: 'Failed to send OTP',
      };
    }
  }

  async getTokens(payload: JwtPayload) {
    const refreshTokenConfig = this.configService.getAuthConfiguration().refreshToken;
    const [access_token, refresh_token] = await Promise.all([
      this.jwtService.signAsync(payload),
      this.jwtService.signAsync(payload, {
        expiresIn: refreshTokenConfig.expireTime,
        secret: refreshTokenConfig.secretKey,
      }),
    ]);
    return {
      access_token,
      refresh_token,
    };
  }

  async checkOtp(
    otp: string,
    user: JwtPayload,
    userType: USER_TYPE,
  ): Promise<{
    user: JwtPayload;
    access_token: string;
    refresh_token: string;
  }> {
    const cacheKey = this.cacheService.getRegisterOTPKey(user.email, userType);
    const cachedOtp = await this.cacheManger.get<string>(cacheKey);
    if (!cachedOtp) {
      throw new BadRequestException(`The OTP is expired`);
    }
    // Đếm số lần nhập sai OTP
    const failKey = `${cacheKey}:fail`;
    let failCount = await this.cacheManger.get<number>(failKey);
    failCount = failCount || 0;
    if (cachedOtp !== otp) {
      failCount++;
      await this.cacheManger.set(failKey, failCount, 180);
      if (failCount >= 3) {
        await this.cacheManger.del(cacheKey);
        await this.cacheManger.del(failKey);
        throw new BadRequestException('OTP is invalid! OTP has been deleted after 3 failed attempts.');
      }
      throw new BadRequestException(`The OTP is invalid!`);
    }
    // Đúng OTP thì xóa cả failKey
    await this.cacheManger.del(cacheKey);
    await this.cacheManger.del(failKey);

    const { access_token, refresh_token } = await this.getTokens(user);
    return {
      user,
      access_token,
      refresh_token,
    };
  }

  async decodeToken(token: string): Promise<JwtPayload> {
    return this.jwtService.verifyAsync<JwtPayload>(token, {
      secret: this.configService.getAuthConfiguration().refreshToken.secretKey,
    });
  }

  async decodeRefreshToken(token: string): Promise<JwtPayload> {
    return this.jwtService.verifyAsync<JwtPayload>(token, {
      secret: this.configService.getAuthConfiguration().refreshToken.secretKey,
    });
  }
}
