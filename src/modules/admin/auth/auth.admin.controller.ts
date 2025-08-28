import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { plainToInstance } from 'class-transformer';
import { CheckOtpRequestDto } from 'src/modules/auth/dtos/check-otp.request.dto';
import { RefreshTokenRequestDto } from 'src/modules/auth/dtos/refresh-token-request.dto';
import { RefreshTokenResponseDto } from 'src/modules/auth/dtos/refresh-token-response.dto';
import { ResetPasswordRequestDto } from 'src/modules/auth/dtos/update-password-request.dto';
import { UserProperties } from 'src/shares/constants/constant';
import { User } from 'src/shares/decorators/user.decorator';
import { CheckOtpResponseDto } from '../../auth/dtos/check-otp.response.dto';
import { AuthAdminService } from './auth.admin.service';
import { ForgotPasswordRequestDto } from './dto/admin.forgot-password.request.dto';
import { ForgotPasswordResponseDto } from './dto/admin.forgot-password.response.dto';
import { AdminLoginResponseDto } from './dto/admin.login-response.dto';
import { AdminResetPasswordResponseDto } from './dto/admin.reset-password.response.dto';
import { AdminJwtAuthGuard } from './guards/admin.jwt-auth.guard';
import { AdminLoginRequestDto } from './dto/admin.login-request.dto';

@Controller('admin/auth')
@ApiTags('Admin.Auth')
export class AuthAdminController {
  constructor(private readonly authAdminService: AuthAdminService) {}

  @ApiOperation({ summary: 'Login admin' })
  @ApiResponse({ type: AdminLoginResponseDto })
  @Post('login')
  async login(@Body() loginDto: AdminLoginRequestDto): Promise<AdminLoginResponseDto> {
    const res = await this.authAdminService.login(loginDto);
    return plainToInstance(AdminLoginResponseDto, res);
  }

  @ApiOperation({ summary: 'Forgot password' })
  @ApiResponse({ type: ForgotPasswordResponseDto })
  @Post('forgot-password')
  async forgotPassword(@Body() forgotPasswordDto: ForgotPasswordRequestDto): Promise<ForgotPasswordResponseDto> {
    const res = await this.authAdminService.forgotPassword(forgotPasswordDto.email);
    return plainToInstance(ForgotPasswordResponseDto, res);
  }

  @ApiOperation({ summary: 'Refresh token' })
  @ApiResponse({ type: RefreshTokenResponseDto })
  @Post('refresh-token')
  async refreshToken(@Body() refreshTokenDto: RefreshTokenRequestDto): Promise<RefreshTokenResponseDto> {
    const res = await this.authAdminService.refreshToken(refreshTokenDto);
    return plainToInstance(RefreshTokenResponseDto, res);
  }

  @ApiOperation({ summary: 'Check OTP' })
  @ApiResponse({ type: CheckOtpResponseDto })
  @Post('check-otp')
  async checkOtp(@Body() checkOtpDto: CheckOtpRequestDto): Promise<CheckOtpResponseDto> {
    const res = await this.authAdminService.checkOtp(checkOtpDto);
    return plainToInstance(CheckOtpResponseDto, res);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Reset password' })
  @ApiResponse({ type: AdminResetPasswordResponseDto })
  @UseGuards(AdminJwtAuthGuard)
  @Post('reset-password')
  async resetPassword(
    @User(UserProperties.USER_EMAIL) email: string,
    @Body() resetPasswordDto: ResetPasswordRequestDto,
  ): Promise<AdminResetPasswordResponseDto> {
    const res = await this.authAdminService.resetPassword(email, resetPasswordDto);
    return plainToInstance(AdminResetPasswordResponseDto, res);
  }
}
