import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from 'src/modules/users/users.controller';
import { UsersService } from 'src/modules/users/users.service';
import { UpdateMeRequestDto } from 'src/modules/users/dtos/update-user-info-request.dto';
import { User } from 'src/modules/users/entities/users.entity';
import { UserStatus } from 'src/modules/users/users.constants';

describe('UsersController', () => {
  let controller: UsersController;
  let service: UsersService;

  const mockUserService = () => ({
    updateMe: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    remove: jest.fn(),
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useFactory: mockUserService,
        },
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);
    service = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('updateMe', () => {
    it('should update user information', async () => {
      const userId = 1;
      const updateUserDto: UpdateMeRequestDto = {
        full_name: 'Test User',
      };
      const user: User = {
        id: 1,
        email: 'test@example.com',
        username: 'testuser',
        status: UserStatus.ACTIVE,
        user_oauth_id: null,
        first_name: '',
        last_name: '',
        phone: '',
        full_name: 'Test User',
        address: '',
        identity_token_id: '',
        avatar: '',
        date_of_birth: undefined,
        gender: undefined,
        age: undefined,
        height_cm: undefined,
        height_unit: undefined,
        weight_kg: undefined,
        weight_unit: undefined,
        coin: 0,
        point: 0,
        user_group_id: undefined,
        userGroup: undefined,
        devices: [],
        coinSetting: undefined,
        userHealthMetrics: [],
        created_at: new Date(),
        updated_at: new Date(),
        generateSlug: jest.fn(),
        castIdToInt: jest.fn(),
      };
      jest.spyOn(service, 'updateMe').mockResolvedValue(user);
      const result = await controller.updateMe({ user: { id: userId } }, updateUserDto);
      expect(service.updateMe).toHaveBeenCalledWith(userId, updateUserDto);
      expect(result).toEqual(expect.objectContaining({ id: 1, full_name: 'Test User' }));
    });
    it('should throw error if service throws', async () => {
      const userId = 1;
      const updateUserDto: UpdateMeRequestDto = { full_name: 'Test User' };
      jest.spyOn(service, 'updateMe').mockRejectedValue(new Error('Update error'));
      await expect(controller.updateMe({ user: { id: userId } }, updateUserDto)).rejects.toThrow('Update error');
    });
  });

  // ...other test cases...
});
