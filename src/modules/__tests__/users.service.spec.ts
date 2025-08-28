import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from 'src/modules/users/users.service';
import { User } from 'src/modules/users/entities/users.entity';
import { UserGroupsService } from 'src/modules/user-groups/user-groups.service';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { BadRequestException } from '@nestjs/common';
import { RegisterRequestDto } from 'src/modules/auth/dtos/register-request.dto';

describe('UsersService', () => {
  let service: UsersService;
  let userRepository: Repository<User>;
  let userGroupsService: UserGroupsService;

  const mockUserRepository = () => ({
    findOne: jest.fn(),
    save: jest.fn(),
    remove: jest.fn(),
    find: jest.fn(),
  });

  const mockUserGroupsService = () => ({
    findByIds: jest.fn(),
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: getRepositoryToken(User), useFactory: mockUserRepository },
        { provide: UserGroupsService, useFactory: mockUserGroupsService },
        { provide: DataSource, useValue: {} },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    userRepository = module.get<Repository<User>>(getRepositoryToken(User));
    userGroupsService = module.get<UserGroupsService>(UserGroupsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('addNewUser', () => {
    it('should successfully register a user', async () => {
      const registerDto: RegisterRequestDto = {
        email: 'test@example.com',
        password: 'password',
        full_name: 'Test User',
        avatar: 'https://image.url',
      };
      const user = { id: 1, email: 'test@example.com' };
      jest.spyOn(service, 'addUserModules').mockResolvedValue(user as any);
      const result = await service.addNewUser(registerDto);
      expect(result).toEqual(user);
      expect(service.addUserModules).toHaveBeenCalledWith(expect.objectContaining(registerDto));
    });
    it('should throw BadRequestException if addUserModules throws', async () => {
      const registerDto: RegisterRequestDto = {
        email: 'invalid-email',
        password: 'short',
      };
      jest.spyOn(service, 'addUserModules').mockRejectedValue({ response: { message: 'error' } });
      await expect(service.addNewUser(registerDto)).rejects.toThrow(BadRequestException);
    });
  });

  describe('getUserByEmail', () => {
    it('should return user if found', async () => {
      const user = { id: 1, email: 'test@example.com' };
      jest.spyOn(userRepository, 'findOne').mockResolvedValue(user as any);
      const result = await service.getUserByEmail('test@example.com');
      expect(result).toEqual(user);
    });
    it('should throw if not found and throwException=true', async () => {
      jest.spyOn(userRepository, 'findOne').mockResolvedValue(null);
      await expect(service.getUserByEmail('notfound', true)).rejects.toThrow(BadRequestException);
    });
    it('should return null if not found and throwException=false', async () => {
      jest.spyOn(userRepository, 'findOne').mockResolvedValue(null);
      const result = await service.getUserByEmail('notfound', false);
      expect(result).toBeNull();
    });
  });

  describe('getUserById', () => {
    it('should return user if found', async () => {
      const user = { id: 1, email: 'test@example.com' };
      jest.spyOn(userRepository, 'findOne').mockResolvedValue(user as any);
      const result = await service.getUserById(1);
      expect(result).toEqual(user);
    });
    it('should throw if not found', async () => {
      jest.spyOn(userRepository, 'findOne').mockResolvedValue(null);
      await expect(service.getUserById(2)).rejects.toThrow(BadRequestException);
    });
  });
});

// ...other tests...
