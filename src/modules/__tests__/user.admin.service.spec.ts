import { Test, TestingModule } from '@nestjs/testing';
import { UserAdminService } from 'src/modules/admin/users/user.admin.service';
import { User } from 'src/modules/users/entities/users.entity';
import { PaginationMetadataHelper } from 'src/shares/pagination/pagination.helper';
import { getRepositoryToken } from '@nestjs/typeorm';

const mockUserRepository = {};
const mockPaginationMetadataHelper = {};

describe('UserAdminService', () => {
  let service: UserAdminService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserAdminService,
        { provide: getRepositoryToken(User), useValue: mockUserRepository },
        { provide: PaginationMetadataHelper, useValue: mockPaginationMetadataHelper },
      ],
    }).compile();
    service = module.get<UserAdminService>(UserAdminService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return data and metadata', async () => {
      const mockQb = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        offset: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        getRawMany: jest.fn().mockResolvedValue([{ id: 1 }]),
        getCount: jest.fn().mockResolvedValue(1),
      };
      (service as unknown as { userRepository: any }).userRepository = {
        createQueryBuilder: jest.fn().mockReturnValue(mockQb),
      };
      (service as unknown as { PaginationMetadataHelper: any }).PaginationMetadataHelper = {
        getMetadata: jest.fn().mockReturnValue({ page: 1 }),
      };
      const query = { page: 1, perPage: 10 };
      const result = await service.findAll(query as Record<string, unknown>);
      expect(result).toEqual({ data: [{ id: 1 }], metadata: { page: 1 } });
    });
    it('should handle filters and search', async () => {
      const mockQb = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        offset: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        getRawMany: jest.fn().mockResolvedValue([{ id: 2 }]),
        getCount: jest.fn().mockResolvedValue(1),
      };
      (service as unknown as { userRepository: any }).userRepository = {
        createQueryBuilder: jest.fn().mockReturnValue(mockQb),
      };
      (service as unknown as { PaginationMetadataHelper: any }).PaginationMetadataHelper = {
        getMetadata: jest.fn().mockReturnValue({ page: 2 }),
      };
      const query = {
        page: 2,
        perPage: 5,
        search: 'abc',
        filters: { status: 1, gender: 0, user_group_name: 'g', device_name: 'd', device_serial_number: 's' },
      };
      const result = await service.findAll(query as Record<string, unknown>);
      expect(result).toEqual({ data: [{ id: 2 }], metadata: { page: 2 } });
    });
    it('should throw if query builder throws', async () => {
      (service as unknown as { userRepository: any }).userRepository = {
        createQueryBuilder: jest.fn().mockImplementation(() => {
          throw new Error('QB error');
        }),
      };
      const query = { page: 1, perPage: 10 };
      await expect(service.findAll(query as Record<string, unknown>)).rejects.toThrow('QB error');
    });
  });
});
