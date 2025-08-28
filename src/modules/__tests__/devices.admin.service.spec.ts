import { Test, TestingModule } from '@nestjs/testing';
import { DevicesAdminService } from '../admin/devices/devices.admin.service';
import { DeviceTypesEntity } from '../devices/entities/devices_type.entity';
import { DevicesEntity } from '../devices/entities/devices.entity';
import { PaginationMetadataHelper } from '../../shares/pagination/pagination.helper';
import { UserAdminService } from '../admin/users/user.admin.service';
import { getRepositoryToken } from '@nestjs/typeorm';

const mockDevicesTypeRepository = {
  createQueryBuilder: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
  findOne: jest.fn(),
};
const mockDevicesRepository = {};
const mockPaginationMetadataHelper = {
  getMetadata: jest.fn(),
};
const mockUserAdminService = {};

describe('DevicesAdminService', () => {
  let service: DevicesAdminService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DevicesAdminService,
        { provide: getRepositoryToken(DeviceTypesEntity), useValue: mockDevicesTypeRepository },
        { provide: getRepositoryToken(DevicesEntity), useValue: mockDevicesRepository },
        { provide: PaginationMetadataHelper, useValue: mockPaginationMetadataHelper },
        { provide: UserAdminService, useValue: mockUserAdminService },
      ],
    }).compile();

    service = module.get<DevicesAdminService>(DevicesAdminService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return paginated device types', async () => {
      const query = { page: 1, perPage: 10, search: '', sortBy: undefined };
      const data = [{ id: 1, name: 'Type A' }];
      const metadata = { total: 1 };
      // Mock query builder chain
      const qb: any = {
        leftJoinAndMapMany: jest.fn().mockReturnThis(),
        groupBy: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        addSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        getRawMany: jest.fn().mockResolvedValue(data),
        getCount: jest.fn().mockResolvedValue(1),
      };
      mockDevicesTypeRepository.createQueryBuilder.mockReturnValue(qb);
      mockPaginationMetadataHelper.getMetadata.mockReturnValue(metadata);
      const serviceWithMocks = new DevicesAdminService(
        mockDevicesTypeRepository as unknown as import('typeorm').Repository<any>,
        mockDevicesRepository as unknown as import('typeorm').Repository<any>,
        mockPaginationMetadataHelper,
        mockUserAdminService as unknown as import('../admin/users/user.admin.service').UserAdminService,
      );
      const result = await serviceWithMocks.findAll(query);
      expect(result).toEqual({ data, metadata });
    });
  });

  describe('createDeviceType', () => {
    it('should create and save a new device type', async () => {
      const dto = { name: 'Type A', bonusPercentage: 10, stepsPerPoint: 100 };
      const entity = { id: 1, ...dto };
      mockDevicesTypeRepository.create.mockReturnValue(entity);
      mockDevicesTypeRepository.save.mockResolvedValue(entity);
      const serviceWithMocks = new DevicesAdminService(
        mockDevicesTypeRepository as unknown as import('typeorm').Repository<any>,
        mockDevicesRepository as unknown as import('typeorm').Repository<any>,
        mockPaginationMetadataHelper,
        mockUserAdminService as unknown as import('../admin/users/user.admin.service').UserAdminService,
      );
      const result = await serviceWithMocks.createDeviceType(dto);
      expect(mockDevicesTypeRepository.create).toHaveBeenCalledWith(dto);
      expect(mockDevicesTypeRepository.save).toHaveBeenCalledWith(entity);
      expect(result).toEqual(entity);
    });
  });

  describe('updateDeviceType', () => {
    it('should update and return the device type if found', async () => {
      const id = 1;
      const dto = { name: 'Type B', bonusPercentage: 20, stepsPerPoint: 200 };
      const found = { id, name: 'Type A', bonusPercentage: 10, stepsPerPoint: 100 };
      const updated = { id, ...dto };
      mockDevicesTypeRepository.findOne.mockResolvedValue(found);
      mockDevicesTypeRepository.save.mockResolvedValue(updated);
      const serviceWithMocks = new DevicesAdminService(
        mockDevicesTypeRepository as unknown as import('typeorm').Repository<any>,
        mockDevicesRepository as unknown as import('typeorm').Repository<any>,
        mockPaginationMetadataHelper,
        mockUserAdminService as unknown as import('../admin/users/user.admin.service').UserAdminService,
      );
      const result = await serviceWithMocks.updateDeviceType(id, dto as any);
      expect(mockDevicesTypeRepository.findOne).toHaveBeenCalledWith({ where: { id } });
      expect(mockDevicesTypeRepository.save).toHaveBeenCalledWith({ ...found, ...dto });
      expect(result).toEqual(updated);
    });
    it('should throw NotFoundException if device type not found', async () => {
      const id = 999;
      mockDevicesTypeRepository.findOne.mockResolvedValue(null);
      const serviceWithMocks = new DevicesAdminService(
        mockDevicesTypeRepository as any,
        mockDevicesRepository as any,
        mockPaginationMetadataHelper as any,
        mockUserAdminService as any,
      );
      await expect(serviceWithMocks.updateDeviceType(id, { name: 'X' } as any)).rejects.toThrow(
        'Device type not found',
      );
    });
  });
});
