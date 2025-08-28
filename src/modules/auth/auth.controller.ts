import { Body, Controller, Get, HttpStatus, Post, Request, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { plainToInstance } from 'class-transformer';
import { AuthService } from './auth.service';
import { LoginRequestDto } from './dtos/login-request.dto';
import { LoginResponseDto } from './dtos/login-response.dto';
import { RegisterRequestDto } from './dtos/register-request.dto';
import { RegisterResponseDto } from './dtos/register-response.dto';
import { LocalAuthGuard } from '../../shares/guards/local-auth.guard';
import { JwtAuthGuard } from 'src/shares/guards/jwt-auth.guard';
import { UserResponseDto } from '../users/dtos/user-response.dto';
import { CommonErrorResponses } from '../../shares/decorators/common-error-responses.decorator';
import { UserProperties } from '../../shares/constants/constant';
import { User } from '../../shares/decorators/user.decorator';
import { RefreshTokenResponseDto } from './dtos/refresh-token-response.dto';
import { RefreshTokenRequestDto } from './dtos/refresh-token-request.dto';
import { CheckEmailRequestDto } from './dtos/check-email-request.dto';
import { CheckEmailResponseDto } from './dtos/check-email-response.dto';
import { LANGUAGE } from '../../shares/constants/constant';
import { i18n } from '../../shares/constants/i18n';
import { UsersService } from '../users/users.service';
import { CacheService } from '../core/cache.service';
import { LoginSsoRequestDto } from './dtos/login-sso-request.dto';
import { ResetPasswordRequestDto } from './dtos/update-password-request.dto';

@Controller('auth')
@ApiTags('Auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly usersService: UsersService,
    private readonly cacheService: CacheService,
  ) {}

  @Post('register')
  @ApiOperation({
    operationId: 'user-register',
    description: 'User register an account',
    summary: 'User register an account',
  })
  @ApiBody({
    type: RegisterRequestDto,
  })
  @ApiResponse({
    type: RegisterResponseDto,
    status: HttpStatus.CREATED,
    description: 'Successful',
  })
  async register(@Body() registerRequest: RegisterRequestDto): Promise<RegisterResponseDto> {
    const res = await this.authService.register(registerRequest);
    return plainToInstance(RegisterResponseDto, res);
  }

  @UseGuards(LocalAuthGuard)
  @Post('login')
  @ApiOperation({
    operationId: 'user-login',
    description: 'User login with username and password, received login token',
    summary: 'User login with username and password, received login token',
  })
  @ApiBody({
    type: LoginRequestDto,
  })
  @ApiResponse({
    type: LoginResponseDto,
    status: HttpStatus.OK,
    description: 'Successful',
  })
  async login(@Request() request): Promise<LoginResponseDto> {
    const { user } = request;
    const res = await this.authService.login(user);
    return plainToInstance(LoginResponseDto, res);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiResponse({
    type: UserResponseDto,
    status: HttpStatus.OK,
    description: 'Successful',
  })
  @CommonErrorResponses()
  @ApiBearerAuth()
  me(@User(UserProperties.USER_ID) userId: number) {
    return this.authService.me(userId);
  }

  @Post('refresh-token')
  @ApiResponse({
    type: RefreshTokenResponseDto,
    status: HttpStatus.OK,
    description: 'Successful',
  })
  @CommonErrorResponses()
  async refreshToken(@Body() refreshTokenInput: RefreshTokenRequestDto): Promise<RefreshTokenResponseDto> {
    return this.authService.refreshToken(refreshTokenInput);
  }

  @Post('check-email')
  @ApiOperation({
    operationId: 'check-email',
    description: 'Check if email already exists',
    summary: 'Check email existence',
  })
  @ApiBody({
    type: CheckEmailRequestDto,
  })
  @ApiResponse({
    type: CheckEmailResponseDto,
    status: HttpStatus.OK,
    description: 'Email existence result',
  })
  async checkEmail(@Body() body: CheckEmailRequestDto, @Request() request): Promise<CheckEmailResponseDto> {
    const exists = await this.authService.checkEmailExists(body.email);
    const language = (request.language as string)?.toLowerCase() || LANGUAGE.EN;
    const messages = i18n[language] ?? i18n[LANGUAGE.EN];
    const message = exists ? messages.emailExists : messages.emailNotExists;
    return { exists, message };
  }

  @Post('check-otp')
  @ApiOperation({
    operationId: 'check-otp',
    description: 'Check OTP and update user status to 1 if valid',
    summary: 'Check OTP for email verification',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        email: { type: 'string', example: 'user@email.com' },
        otp: { type: 'string', example: '123456' },
      },
      required: ['email', 'otp'],
    },
  })
  @ApiResponse({
    status: HttpStatus.OK,
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        message: { type: 'string' },
      },
    },
  })
  async checkOtp(@Body() body: { email: string; otp: string }): Promise<any> {
    const { email, otp } = body;
    return this.authService.checkOtp(email, otp);
  }

  @Post('send-otp')
  @ApiOperation({
    operationId: 'send-otp',
    description: 'Send OTP to email for verification',
    summary: 'Send OTP to email',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        email: { type: 'string', example: 'user@email.com' },
      },
      required: ['email'],
    },
  })
  @ApiResponse({
    status: HttpStatus.OK,
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        message: { type: 'string' },
      },
    },
  })
  async sendOtp(@Body() body: { email: string }): Promise<{ success: boolean; message: string }> {
    const { email } = body;
    return this.authService.sendOtp(email);
  }

  @Post('sso')
  @ApiOperation({
    operationId: 'Auth_ssoLogin',
    description: 'Login with SSO using Firebase ID token',
    summary: 'Login with SSO',
  })
  @ApiBody({
    type: LoginSsoRequestDto,
  })
  @ApiResponse({
    type: LoginResponseDto,
    status: HttpStatus.OK,
    description: 'Successful',
  })
  async ssoLogin(@Body() body: LoginSsoRequestDto): Promise<LoginResponseDto> {
    const res = await this.authService.loginWithFirebaseIdToken(body.idToken);
    return plainToInstance(LoginResponseDto, res);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Reset password' })
  @ApiResponse({ type: UserResponseDto })
  @Post('reset-password')
  @UseGuards(JwtAuthGuard)
  async resetPassword(
    @User(UserProperties.USER_EMAIL) email: string,
    @Body() resetPasswordDto: ResetPasswordRequestDto,
  ): Promise<UserResponseDto> {
    const res = await this.authService.resetPassword(email, resetPasswordDto);
    return plainToInstance(UserResponseDto, res);
  }
}
