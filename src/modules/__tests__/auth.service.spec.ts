import { AuthService } from 'src/modules/auth/auth.service';
import { User } from 'src/modules/users/entities/users.entity';
import { UserStatus, UserGender, HeightUnit, WeightUnit } from 'src/modules/users/users.constants';
import { UserResponseDto } from 'src/modules/users/dtos/user-response.dto';
import { UserCredentialService } from 'src/modules/user-credential/user-credential.service';
import { AuthCommonService } from 'src/modules/auth/auth.common.service';
import { UserOauthProviderService } from 'src/modules/user-oauth-provider/user-oauth-provider.service';
import { UsersService } from 'src/modules/users/users.service';

jest.mock('firebase-admin', () => ({
  credential: {
    cert: jest.fn(),
  },
  initializeApp: jest.fn(),
  auth: jest.fn(),
}));

describe('AuthService', () => {
  let service: AuthService;
  let usersService: jest.Mocked<UsersService>;
  let userCredentialService: jest.Mocked<UserCredentialService>;
  let authCommonService: jest.Mocked<AuthCommonService>;
  let userOauthProviderService: jest.Mocked<UserOauthProviderService>;

  beforeEach(async () => {
    usersService = {
      findByEmail: jest.fn(),
      addNewUser: jest.fn(),
      getUserById: jest.fn(),
      updateUserStatusByEmail: jest.fn(),
    } as any;
    userCredentialService = {
      getUserWithUsernameAndPassword: jest.fn(),
      resetPassword: jest.fn(),
    } as any;
    authCommonService = {
      getTokens: jest.fn(),
      sendOtp: jest.fn(),
      decodeRefreshToken: jest.fn(),
      checkOtp: jest.fn(),
    } as any;
    userOauthProviderService = {} as any;

    service = new AuthService(
      usersService as any,
      userCredentialService as any,
      authCommonService as any,
      userOauthProviderService as any,
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('validateUserWithUsernameAndPassword', () => {
    it('should call userCredentialService.getUserWithUsernameAndPassword', async () => {
      const email = 'test@email.com';
      const password = '123456';
      const user: User = {
        id: 1,
        email,
        username: '',
        status: UserStatus.ACTIVE,
        user_oauth_id: null,
        first_name: '',
        last_name: '',
        full_name: '',
        address: '',
        avatar: '',
        phone: '',
        gender: UserGender.MALE,
        date_of_birth: new Date(),
        created_at: new Date(),
        updated_at: new Date(),
        user_group_id: null,
        userGroup: null,
        height_cm: 170,
        height_unit: HeightUnit.CM,
        weight_kg: 60,
        weight_unit: WeightUnit.KG,
        age: 30,
        coin: 0,
        point: 0,
        userHealthMetrics: [],
        devices: [],
        coinSetting: null,
        generateSlug: jest.fn(),
        castIdToInt: jest.fn(),
      };
      userCredentialService.getUserWithUsernameAndPassword.mockResolvedValue(user);
      const result = await service.validateUserWithUsernameAndPassword(email, password);
      expect(userCredentialService.getUserWithUsernameAndPassword).toHaveBeenCalledWith(email, password);
      expect(result).toEqual(user);
    });
  });

  describe('login', () => {
    it('should call authCommonService.getTokens and return tokens', async () => {
      const user: UserResponseDto = {
        id: 1,
        email: 'test@email.com',
        status: UserStatus.ACTIVE,
        full_name: 'Test User',
        address: '',
        avatar: '',
        gender: UserGender.MALE,
        date_of_birth: null,
        height_cm: 170,
        height_ft: null,
        height_in: null,
        height_unit: 'cm',
        weight_kg: 70,
        weight_lb: null,
        weight_unit: 'kg',
      };
      const tokens = { access_token: 'token', refresh_token: 'refresh' };
      authCommonService.getTokens.mockResolvedValue(tokens);
      const result = await service.login(user);
      expect(authCommonService.getTokens).toHaveBeenCalledWith({ id: user.id, email: user.email });
      expect(result).toEqual({ user: { id: user.id, email: user.email }, ...tokens });
    });
  });

  describe('register', () => {
    it('should call usersService.addNewUser and sendOtp', async () => {
      const dto = { email: 'test@email.com', password: '123456' };
      const user = { id: 1, email: dto.email };
      usersService.addNewUser = jest.fn().mockResolvedValue(user);
      authCommonService.sendOtp.mockResolvedValue(undefined);
      const result = await service.register(dto);
      expect(usersService.addNewUser).toHaveBeenCalledWith(dto);
      expect(authCommonService.sendOtp).toHaveBeenCalledWith(user.email, expect.anything());
      expect(result).toEqual({ user: { id: user.id, email: user.email } });
    });
  });

  describe('sendOtp', () => {
    it('should throw if user not found', async () => {
      usersService.findByEmail.mockResolvedValue(null);
      await expect(service.sendOtp('notfound@email.com')).rejects.toThrow('Email does not exist');
    });
    it('should call authCommonService.sendOtp if user exists', async () => {
      const email = 'test@email.com';
      const user: User = {
        id: 1,
        email,
        username: '',
        status: UserStatus.ACTIVE,
        user_oauth_id: null,
        first_name: '',
        last_name: '',
        full_name: '',
        address: '',
        avatar: '',
        phone: '',
        gender: UserGender.MALE,
        date_of_birth: new Date(),
        created_at: new Date(),
        updated_at: new Date(),
        user_group_id: null,
        userGroup: null,
        height_cm: 170,
        height_unit: HeightUnit.CM,
        weight_kg: 60,
        weight_unit: WeightUnit.KG,
        age: 30,
        coin: 0,
        point: 0,
        userHealthMetrics: [],
        devices: [],
        coinSetting: null,
        generateSlug: jest.fn(),
        castIdToInt: jest.fn(),
      };
      usersService.findByEmail.mockResolvedValue(user);
      authCommonService.sendOtp.mockResolvedValue({ success: true, message: 'sent' });
      const result = await service.sendOtp(email);
      expect(authCommonService.sendOtp).toHaveBeenCalledWith(email, expect.anything());
      expect(result).toEqual({ success: true, message: 'sent' });
    });
  });

  describe('me', () => {
    it('should call usersService.getUserById', () => {
      usersService.getUserById = jest.fn().mockReturnValue({ id: 1, email: 'test@email.com' });
      const result = service.me(1);
      expect(usersService.getUserById).toHaveBeenCalledWith(1);
      expect(result).toEqual({ id: 1, email: 'test@email.com' });
    });
  });

  describe('refreshToken', () => {
    it('should throw if user not found in refresh token', async () => {
      authCommonService.decodeRefreshToken.mockResolvedValue(null);
      await expect(service.refreshToken({ refresh_token: 'bad' })).rejects.toThrow('User not found');
    });
    it('should call authCommonService.getTokens if user found', async () => {
      const user = { id: 1, email: 'test@email.com' };
      authCommonService.decodeRefreshToken.mockResolvedValue(user);
      authCommonService.getTokens.mockResolvedValue({ access_token: 'token', refresh_token: 'refresh' });
      const result = await service.refreshToken({ refresh_token: 'good' });
      expect(authCommonService.getTokens).toHaveBeenCalledWith({ id: user.id, email: user.email });
      expect(result).toEqual({ access_token: 'token', refresh_token: 'refresh' });
    });
  });

  describe('checkEmailExists', () => {
    it('should return true if user exists', async () => {
      const user: User = {
        id: 1,
        email: 'test@email.com',
        username: '',
        status: UserStatus.ACTIVE,
        user_oauth_id: null,
        first_name: '',
        last_name: '',
        full_name: '',
        address: '',
        avatar: '',
        phone: '',
        gender: UserGender.MALE,
        date_of_birth: new Date(),
        created_at: new Date(),
        updated_at: new Date(),
        user_group_id: null,
        userGroup: null,
        height_cm: 170,
        height_unit: HeightUnit.CM,
        weight_kg: 60,
        weight_unit: WeightUnit.KG,
        age: 30,
        coin: 0,
        point: 0,
        userHealthMetrics: [],
        devices: [],
        coinSetting: null,
        generateSlug: jest.fn(),
        castIdToInt: jest.fn(),
      };
      usersService.findByEmail.mockResolvedValue(user);
      const result = await service.checkEmailExists('test@email.com');
      expect(result).toBe(true);
    });
    it('should return false if user does not exist', async () => {
      usersService.findByEmail.mockResolvedValue(null);
      const result = await service.checkEmailExists('notfound@email.com');
      expect(result).toBe(false);
    });
  });

  describe('checkOtp', () => {
    it('should throw if user not found', async () => {
      usersService.findByEmail.mockResolvedValue(null);
      await expect(service.checkOtp('notfound@email.com', 'otp')).rejects.toThrow('User not found!');
    });
    it('should call authCommonService.checkOtp and update user status', async () => {
      const email = 'test@email.com';
      const user: User = {
        id: 1,
        email,
        username: '',
        status: UserStatus.ACTIVE,
        user_oauth_id: null,
        first_name: '',
        last_name: '',
        full_name: '',
        address: '',
        avatar: '',
        phone: '',
        gender: UserGender.MALE,
        date_of_birth: new Date(),
        created_at: new Date(),
        updated_at: new Date(),
        user_group_id: null,
        userGroup: null,
        height_cm: 170,
        height_unit: HeightUnit.CM,
        weight_kg: 60,
        weight_unit: WeightUnit.KG,
        age: 30,
        coin: 0,
        point: 0,
        userHealthMetrics: [],
        devices: [],
        coinSetting: null,
        generateSlug: jest.fn(),
        castIdToInt: jest.fn(),
      };
      usersService.findByEmail.mockResolvedValue(user);
      authCommonService.checkOtp.mockResolvedValue({
        user: { id: user.id, email: user.email },
        access_token: 'token',
        refresh_token: 'refresh',
      });
      usersService.updateUserStatusByEmail = jest.fn().mockResolvedValue(undefined);
      const result = await service.checkOtp(email, 'otp');
      expect(authCommonService.checkOtp).toHaveBeenCalledWith(
        'otp',
        { id: user.id, email: user.email },
        expect.anything(),
      );
      expect(usersService.updateUserStatusByEmail).toHaveBeenCalledWith(email, expect.anything());
      expect(result).toEqual({
        user: { id: user.id, email: user.email },
        access_token: 'token',
        refresh_token: 'refresh',
      });
    });
  });

  describe('resetPassword', () => {
    it('should throw if user not found', async () => {
      usersService.findByEmail.mockResolvedValue(null);
      await expect(service.resetPassword('notfound@email.com', { newPassword: '123' })).rejects.toThrow(
        'Email does not exist',
      );
    });
    it('should call userCredentialService.resetPassword and return user', async () => {
      const email = 'test@email.com';
      const user: User = {
        id: 1,
        email,
        username: '',
        status: UserStatus.ACTIVE,
        user_oauth_id: null,
        first_name: '',
        last_name: '',
        full_name: '',
        address: '',
        avatar: '',
        phone: '',
        gender: UserGender.MALE,
        date_of_birth: new Date(),
        created_at: new Date(),
        updated_at: new Date(),
        user_group_id: null,
        userGroup: null,
        height_cm: 170,
        height_unit: HeightUnit.CM,
        weight_kg: 60,
        weight_unit: WeightUnit.KG,
        age: 30,
        coin: 0,
        point: 0,
        userHealthMetrics: [],
        devices: [],
        coinSetting: null,
        generateSlug: jest.fn(),
        castIdToInt: jest.fn(),
      };
      usersService.findByEmail.mockResolvedValue(user);
      userCredentialService.resetPassword = jest.fn().mockResolvedValue({ user });
      const result = await service.resetPassword(email, { newPassword: '123' });
      expect(userCredentialService.resetPassword).toHaveBeenCalledWith(email, '123');
      expect(result).toEqual(user);
    });
  });
});
