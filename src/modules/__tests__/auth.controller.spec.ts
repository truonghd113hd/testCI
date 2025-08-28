import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from '../auth/auth.controller';
import { AuthService } from '../auth/auth.service';
import { UsersService } from '../users/users.service';
import { CacheService } from '../core/cache.service';

// Mock dependencies
const mockAuthService = {
  register: jest.fn(),
  login: jest.fn(),
  me: jest.fn(),
  refreshToken: jest.fn(),
  checkEmailExists: jest.fn(),
  checkOtp: jest.fn(),
  sendOtp: jest.fn(),
  loginWithFirebaseIdToken: jest.fn(),
  resetPassword: jest.fn(),
};
const mockUsersService = {};
const mockCacheService = {};
jest.mock('firebase-admin', () => ({
  credential: {
    cert: jest.fn(),
  },
  initializeApp: jest.fn(),
  auth: jest.fn(),
}));

describe('AuthController', () => {
  let controller: AuthController;
  let authService: typeof mockAuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        { provide: AuthService, useValue: mockAuthService },
        { provide: UsersService, useValue: mockUsersService },
        { provide: CacheService, useValue: mockCacheService },
      ],
    }).compile();
    controller = module.get<AuthController>(AuthController);
    authService = module.get(AuthService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('register', () => {
    it('should call authService.register and return response', async () => {
      const dto = { email: 'test@email.com', password: '123456' };
      const result = { user: { id: 1, email: dto.email } };
      authService.register.mockResolvedValue(result);
      const response = await controller.register(dto as any);
      expect(authService.register).toHaveBeenCalledWith(dto);
      expect(response).toEqual(result);
    });
  });

  describe('login', () => {
    it('should call authService.login and return response', async () => {
      const user = { id: 1, email: 'test@email.com' };
      const req = { user };
      const result = { user, access_token: 'token', refresh_token: 'refresh' };
      authService.login.mockResolvedValue(result);
      const response = await controller.login(req);
      expect(authService.login).toHaveBeenCalledWith(user);
      expect(response).toEqual(result);
    });
  });

  describe('me', () => {
    it('should call authService.me and return user', () => {
      const userId = 1;
      const user = { id: userId, email: 'test@email.com' };
      authService.me.mockReturnValue(user);
      const response = controller.me(userId);
      expect(authService.me).toHaveBeenCalledWith(userId);
      expect(response).toEqual(user);
    });
  });

  describe('refreshToken', () => {
    it('should call authService.refreshToken and return tokens', async () => {
      const dto = { refresh_token: 'refresh' };
      const result = { access_token: 'token', refresh_token: 'refresh' };
      authService.refreshToken.mockResolvedValue(result);
      const response = await controller.refreshToken(dto as any);
      expect(authService.refreshToken).toHaveBeenCalledWith(dto);
      expect(response).toEqual(result);
    });
  });

  describe('checkEmail', () => {
    it('should return exists=true and correct message if email exists', async () => {
      authService.checkEmailExists.mockResolvedValue(true);
      const body = { email: 'test@email.com' };
      const req = { language: 'en' };
      const response = await controller.checkEmail(body, req);
      expect(authService.checkEmailExists).toHaveBeenCalledWith(body.email);
      expect(response.exists).toBe(true);
      expect(typeof response.message).toBe('string');
    });
    it('should return exists=false and correct message if email does not exist', async () => {
      authService.checkEmailExists.mockResolvedValue(false);
      const body = { email: 'notfound@email.com' };
      const req = { language: 'en' };
      const response = await controller.checkEmail(body, req);
      expect(authService.checkEmailExists).toHaveBeenCalledWith(body.email);
      expect(response.exists).toBe(false);
      expect(typeof response.message).toBe('string');
    });
  });

  describe('checkOtp', () => {
    it('should call authService.checkOtp and return result', async () => {
      const body = { email: 'test@email.com', otp: '123456' };
      const result = { user: { id: 1, email: body.email }, access_token: 'token', refresh_token: 'refresh' };
      authService.checkOtp.mockResolvedValue(result);
      const response = await controller.checkOtp(body);
      expect(authService.checkOtp).toHaveBeenCalledWith(body.email, body.otp);
      expect(response).toEqual(result);
    });
  });

  describe('sendOtp', () => {
    it('should call authService.sendOtp and return result', async () => {
      const body = { email: 'test@email.com' };
      const result = { success: true, message: 'sent' };
      authService.sendOtp.mockResolvedValue(result);
      const response = await controller.sendOtp(body);
      expect(authService.sendOtp).toHaveBeenCalledWith(body.email);
      expect(response).toEqual(result);
    });
  });

  describe('ssoLogin', () => {
    it('should call authService.loginWithFirebaseIdToken and return result', async () => {
      const body = { idToken: 'firebase-token' };
      const result = { user: { id: 1, email: 'test@email.com' }, access_token: 'token', refresh_token: 'refresh' };
      authService.loginWithFirebaseIdToken.mockResolvedValue(result);
      const response = await controller.ssoLogin(body as any);
      expect(authService.loginWithFirebaseIdToken).toHaveBeenCalledWith(body.idToken);
      expect(response).toEqual(result);
    });
  });

  describe('resetPassword', () => {
    it('should call authService.resetPassword and return user', async () => {
      const email = 'test@email.com';
      const dto = { newPassword: 'newpass' };
      const user = { id: 1, email };
      authService.resetPassword.mockResolvedValue(user);
      const response = await controller.resetPassword(email, dto as any);
      expect(authService.resetPassword).toHaveBeenCalledWith(email, dto);
      expect(response).toEqual(expect.objectContaining({ id: 1, email }));
    });
  });
});
