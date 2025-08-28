import { Test, TestingModule } from '@nestjs/testing';
import { AuthAdminService } from 'src/modules/admin/auth/auth.admin.service';
import { AdminService } from 'src/modules/admin/admin/admin.service';
import { AuthCommonService } from 'src/modules/auth/auth.common.service';
import { USER_TYPE } from 'src/modules/auth/auth.type';
import * as bcrypt from 'bcrypt';

const mockAdminService = {
  findByEmail: jest.fn(),
  updatePassword: jest.fn(),
};
const mockAuthCommonService = {
  login: jest.fn(),
  sendOtp: jest.fn(),
  checkOtp: jest.fn(),
  getTokens: jest.fn(),
  decodeRefreshToken: jest.fn(),
};
jest.mock('bcrypt');
jest.mock('firebase-admin', () => ({
  credential: {
    cert: jest.fn(),
  },
  initializeApp: jest.fn(),
  auth: jest.fn(),
}));

describe('AuthAdminService', () => {
  let service: AuthAdminService;

  beforeEach(async () => {
    jest.resetAllMocks();
    (bcrypt.compare as jest.Mock).mockResolvedValue(true);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthAdminService,
        { provide: AdminService, useValue: mockAdminService },
        { provide: AuthCommonService, useValue: mockAuthCommonService },
      ],
    }).compile();

    service = module.get<AuthAdminService>(AuthAdminService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('login should throw if admin not found', async () => {
    mockAdminService.findByEmail.mockResolvedValue(undefined);
    await expect(service.login({ email: 'a', password: 'b' })).rejects.toThrow('Invalid email or password');
  });

  it('login should call AuthCommonService.login if valid', async () => {
    const admin = { id: 1, email: 'admin@example.com', password: 'hashed' };
    mockAdminService.findByEmail.mockResolvedValue(admin);
    mockAuthCommonService.login.mockResolvedValue({ token: 't' });
    const result = await service.login({ email: admin.email, password: 'hashed' });
    expect(mockAuthCommonService.login).toHaveBeenCalledWith(admin);
    expect(result).toEqual({ token: 't' });
  });

  it('forgotPassword should throw if admin not found', async () => {
    mockAdminService.findByEmail.mockResolvedValue(undefined);
    await expect(service.forgotPassword('notfound@example.com')).rejects.toThrow('Email does not exist');
  });

  it('forgotPassword should call sendOtp if admin exists', async () => {
    const admin = { id: 1, email: 'admin@example.com' };
    mockAdminService.findByEmail.mockResolvedValue(admin);
    mockAuthCommonService.sendOtp.mockResolvedValue({ success: true });
    const result = await service.forgotPassword(admin.email);
    expect(mockAuthCommonService.sendOtp).toHaveBeenCalledWith(admin.email, USER_TYPE.ADMIN);
    expect(result).toEqual({ success: true });
  });

  it('checkOtp should throw if admin not found', async () => {
    mockAdminService.findByEmail.mockResolvedValue(undefined);
    await expect(service.checkOtp({ email: 'notfound', otp: '123' })).rejects.toThrow('Email does not exist');
  });

  it('checkOtp should call AuthCommonService.checkOtp if admin exists', async () => {
    const admin = { id: 1, email: 'admin@example.com' };
    mockAdminService.findByEmail.mockResolvedValue(admin);
    mockAuthCommonService.checkOtp.mockResolvedValue({ success: true });
    const payload = { email: admin.email, otp: '123' };
    const result = await service.checkOtp(payload);
    expect(mockAuthCommonService.checkOtp).toHaveBeenCalledWith(
      '123',
      { id: admin.id, email: admin.email },
      USER_TYPE.ADMIN,
    );
    expect(result).toEqual({ success: true });
  });

  it('refreshToken should throw if user not found', async () => {
    mockAuthCommonService.decodeRefreshToken.mockResolvedValue(undefined);
    await expect(service.refreshToken({ refresh_token: 't' })).rejects.toThrow('User not found');
  });

  it('refreshToken should return tokens if user found', async () => {
    const admin = { id: 1, email: 'admin@example.com' };
    mockAuthCommonService.decodeRefreshToken.mockResolvedValue(admin);
    mockAuthCommonService.getTokens.mockResolvedValue({ access_token: 'a' });
    const result = await service.refreshToken({ refresh_token: 't' });
    expect(mockAuthCommonService.getTokens).toHaveBeenCalledWith(admin);
    expect(result).toEqual({ access_token: 'a' });
  });

  it('resetPassword should throw if admin not found', async () => {
    mockAdminService.findByEmail.mockResolvedValue(undefined);
    await expect(service.resetPassword('notfound', { newPassword: '123' })).rejects.toThrow('Email does not exist');
  });

  it('resetPassword should call updatePassword if admin exists', async () => {
    const admin = { id: 1, email: 'admin@example.com', password: 'hashed' };
    mockAdminService.findByEmail.mockResolvedValue(admin);
    mockAdminService.updatePassword.mockResolvedValue({ success: true });
    const dto = { newPassword: '123' };
    const result = await service.resetPassword(admin.email, dto);
    expect(result).toEqual({ success: true });
  });
});
