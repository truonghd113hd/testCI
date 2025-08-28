import { Test, TestingModule } from '@nestjs/testing';
import { AuthAdminController } from 'src/modules/admin/auth/auth.admin.controller';
import { AuthAdminService } from 'src/modules/admin/auth/auth.admin.service';
import { AdminLoginResponseDto } from 'src/modules/admin/auth/dto/admin.login-response.dto';
import { AdminResetPasswordResponseDto } from 'src/modules/admin/auth/dto/admin.reset-password.response.dto';

const mockAuthAdminService = {
  login: jest.fn(),
  forgotPassword: jest.fn(),
  refreshToken: jest.fn(),
  checkOtp: jest.fn(),
  resetPassword: jest.fn(),
};

describe('AuthAdminController', () => {
  let controller: AuthAdminController;
  let service: typeof mockAuthAdminService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthAdminController],
      providers: [{ provide: AuthAdminService, useValue: mockAuthAdminService }],
    }).compile();
    controller = module.get<AuthAdminController>(AuthAdminController);
    service = module.get(AuthAdminService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('login should call service and return result', async () => {
    const dto = { email: 'admin@example.com', password: '123' };
    const expected = new AdminLoginResponseDto();
    service.login.mockResolvedValue(expected);
    const result = await controller.login(dto);
    expect(service.login).toHaveBeenCalledWith(dto);
    expect(result).toEqual(expect.any(AdminLoginResponseDto));
  });

  it('forgotPassword should call service and return result', async () => {
    const dto = { email: 'admin@example.com' };
    service.forgotPassword.mockResolvedValue({ success: true });
    const result = await controller.forgotPassword(dto);
    expect(service.forgotPassword).toHaveBeenCalledWith(dto.email);
    expect(result).toEqual({ success: true });
  });

  it('refreshToken should call service and return result', async () => {
    const dto = { refresh_token: 't' };
    service.refreshToken.mockResolvedValue({ access_token: 'a' });
    const result = await controller.refreshToken(dto);
    expect(service.refreshToken).toHaveBeenCalledWith(dto);
    expect(result).toEqual({ access_token: 'a' });
  });

  it('checkOtp should call service and return result', async () => {
    const dto = { email: 'admin@example.com', otp: '123' };
    service.checkOtp.mockResolvedValue({ success: true });
    const result = await controller.checkOtp(dto);
    expect(service.checkOtp).toHaveBeenCalledWith(dto);
    expect(result).toEqual({ success: true });
  });

  it('resetPassword should call service and return result', async () => {
    const email = 'admin@example.com';
    const dto = { newPassword: '123' };
    const expected = new AdminResetPasswordResponseDto();
    service.resetPassword.mockResolvedValue(expected);
    const result = await controller.resetPassword(email, dto);
    expect(service.resetPassword).toHaveBeenCalledWith(email, dto);
    expect(result).toEqual(expect.any(AdminResetPasswordResponseDto));
  });
});
