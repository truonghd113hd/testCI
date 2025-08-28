import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { AuthCommonService } from 'src/modules/auth/auth.common.service';
import { CheckOtpRequestDto } from 'src/modules/auth/dtos/check-otp.request.dto';
import { CheckOtpResponseDto } from 'src/modules/auth/dtos/check-otp.response.dto';
import { RefreshTokenRequestDto } from 'src/modules/auth/dtos/refresh-token-request.dto';
import { ResetPasswordRequestDto } from 'src/modules/auth/dtos/update-password-request.dto';
import { hashString } from 'src/shares/helpers/cryptography';
import { AdminService } from '../admin/admin.service';
import { AdminEntity } from '../admin/entities/admin.entity';
import { AdminLoginRequestDto } from './dto/admin.login-request.dto';
import { USER_TYPE } from 'src/modules/auth/auth.type';

@Injectable()
export class AuthAdminService {
  constructor(
    private readonly adminService: AdminService,
    private readonly authCommonService: AuthCommonService,
  ) {}

  async login(loginDto: AdminLoginRequestDto) {
    // Kiểm tra cả email và password
    const admin = await this.adminService.findByEmail(loginDto.email);
    if (!admin) {
      throw new UnauthorizedException('Invalid email or password');
    }
    const isPasswordValid = await bcrypt.compare(loginDto.password, admin.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid email or password');
    }
    return this.authCommonService.login(admin);
  }

  async validateUserWithUsernameAndPassword(email: string, password: string): Promise<AdminEntity> {
    const admin = await this.adminService.findByEmail(email);

    if (!admin) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const isPasswordValid = await bcrypt.compare(password, admin.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid email or password');
    }

    return admin;
  }

  async forgotPassword(email: string): Promise<{ success: boolean; message: string }> {
    const admin = await this.adminService.findByEmail(email);
    if (!admin) {
      throw new BadRequestException(`Email does not exist`);
    }

    return this.authCommonService.sendOtp(email, USER_TYPE.ADMIN);
  }

  async checkOtp(payload: CheckOtpRequestDto): Promise<CheckOtpResponseDto> {
    const admin = await this.adminService.findByEmail(payload.email);
    if (!admin) {
      throw new BadRequestException(`Email does not exist`);
    }
    return this.authCommonService.checkOtp(payload.otp, { id: admin.id, email: admin.email }, USER_TYPE.ADMIN);
  }

  async refreshToken(data: RefreshTokenRequestDto) {
    const user = await this.authCommonService.decodeRefreshToken(data.refresh_token);
    if (!user) {
      throw new BadRequestException(`User not found`);
    }
    return this.authCommonService.getTokens(user);
  }

  async resetPassword(email: string, payload: ResetPasswordRequestDto) {
    const admin = await this.adminService.findByEmail(email);
    if (!admin) {
      throw new BadRequestException(`Email does not exist`);
    }
    const hashedPassword = await hashString(payload.newPassword);
    return this.adminService.updatePassword(admin, hashedPassword);
  }
}
