import { Test, TestingModule } from '@nestjs/testing';
import { UserGroupsService } from 'src/modules/user-groups/user-groups.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { UserGroupsEntity } from 'src/modules/admin/user-groups/entities/user-groups.entity';
import { Repository } from 'typeorm';
import { NotFoundException } from '@nestjs/common';

describe('UserGroupsService', () => {
  let service: UserGroupsService;
  let repo: Repository<UserGroupsEntity>;

  const mockRepo = {
    findOne: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UserGroupsService, { provide: getRepositoryToken(UserGroupsEntity), useValue: mockRepo }],
    }).compile();
    service = module.get<UserGroupsService>(UserGroupsService);
    repo = module.get(getRepositoryToken(UserGroupsEntity));
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should return user group if found', async () => {
    const entity = { id: 1, name: 'group1' } as UserGroupsEntity;
    mockRepo.findOne.mockResolvedValue(entity);
    const result = await service.findByName('group1');
    expect(mockRepo.findOne).toHaveBeenCalledWith({ where: { name: 'group1' } });
    expect(result).toEqual(entity);
  });

  it('should throw NotFoundException if not found', async () => {
    mockRepo.findOne.mockResolvedValue(null);
    await expect(service.findByName('notfound')).rejects.toThrow(NotFoundException);
  });
});
