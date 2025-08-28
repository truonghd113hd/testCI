import { Repository } from 'typeorm';
import { Test, TestingModule } from '@nestjs/testing';
import { DevicesService } from 'src/modules/devices/devices.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { DevicesEntity } from 'src/modules/devices/entities/devices.entity';
import { DeviceTypesEntity } from 'src/modules/devices/entities/devices_type.entity';
import { UserHealthMetric } from 'src/modules/user-health-metric/entities/user-health-metric.entity';
import { PaginationMetadataHelper } from 'src/shares/pagination/pagination.helper';
import { ListDevicesQueryDto } from 'src/modules/devices/dto/list-devices.query.dto';
import { AddDeviceDto } from 'src/modules/devices/dto/add-device.dto';

describe('DevicesService', () => {
  let service: DevicesService;

  const mockDevicesRepository = () => ({
    find: jest.fn(),
    findOne: jest.fn(),
    save: jest.fn(),
    remove: jest.fn(),
  });

  const mockDeviceTypesRepository = () => ({
    find: jest.fn(),
    findOne: jest.fn(),
  });

  const mockUserHealthMetricRepository = () => ({
    find: jest.fn(),
    findOne: jest.fn(),
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DevicesService,
        {
          provide: getRepositoryToken(DevicesEntity),
          useFactory: mockDevicesRepository,
        },
        {
          provide: getRepositoryToken(DeviceTypesEntity),
          useFactory: mockDeviceTypesRepository,
        },
        {
          provide: getRepositoryToken(UserHealthMetric),
          useFactory: mockUserHealthMetricRepository,
        },
        { provide: PaginationMetadataHelper, useValue: { getMetadata: jest.fn().mockReturnValue({}) } },
      ],
    }).compile();

    service = module.get<DevicesService>(DevicesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getDevicesByUserId', () => {
    it('should throw if userId is missing', async () => {
      const query = new ListDevicesQueryDto();
      await expect(service.getDevicesByUserId(undefined as number, query)).rejects.toThrow('User ID is required');
    });
    it('should return data and metadata', async () => {
      const userId = 1;
      const query: ListDevicesQueryDto = Object.assign(new ListDevicesQueryDto(), {
        page: 1,
        perPage: 10,
        orderBy: 'DESC',
        userId: 1,
        name: '',
        status: undefined,
        serialNumber: undefined,
      });
      const mockQueryBuilder: Partial<ReturnType<Repository<DevicesEntity>['createQueryBuilder']>> = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        addSelect: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        offset: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        getRawMany: jest.fn().mockResolvedValue([{ id: 1 }]),
        getCount: jest.fn().mockResolvedValue(1),
      };
      (service as any).devicesRepository.createQueryBuilder = jest.fn().mockReturnValue(mockQueryBuilder);
      (service as any).paginationMetadataHelper = { getMetadata: jest.fn().mockReturnValue({ page: 1 }) };
      const result = await service.getDevicesByUserId(userId, query);
      expect(result).toEqual({ data: [{ id: 1 }], metadata: { page: 1 } });
    });
  });

  describe('addDevice', () => {
    it('should throw if IMEI already exists', async () => {
      (service as any).devicesRepository.findOne = jest.fn().mockResolvedValueOnce({ id: 1 });
      const addDeviceDto: AddDeviceDto = Object.assign(new AddDeviceDto(), {
        IMEI: '123',
        serial_number: 'SN',
        name: 'Device',
        type: 'TYPE',
      });
      await expect(service.addDevice(1, addDeviceDto)).rejects.toThrow('IMEI already exists');
    });
    it('should throw if serial number already exists', async () => {
      (service as any).devicesRepository.findOne = jest
        .fn()
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce({ id: 2 });
      const addDeviceDto2: AddDeviceDto = Object.assign(new AddDeviceDto(), {
        IMEI: '123',
        serial_number: 'SN',
        name: 'Device',
        type: 'TYPE',
      });
      await expect(service.addDevice(1, addDeviceDto2)).rejects.toThrow('Serial number already exists');
    });
    it('should throw if device type not found', async () => {
      (service as any).devicesRepository.findOne = jest.fn().mockResolvedValueOnce(null).mockResolvedValueOnce(null);
      (service as any).devicesTypeRepository.findOne = jest.fn().mockResolvedValue(null);
      const addDeviceDto3: AddDeviceDto = Object.assign(new AddDeviceDto(), {
        IMEI: '123',
        serial_number: 'SN',
        name: 'Device',
        type: 'TYPE',
      });
      await expect(service.addDevice(1, addDeviceDto3)).rejects.toThrow('Device type not found');
    });
    it('should save and return device if all valid', async () => {
      (service as any).devicesRepository.findOne = jest.fn().mockResolvedValueOnce(null).mockResolvedValueOnce(null);
      (service as any).devicesTypeRepository.findOne = jest.fn().mockResolvedValue({ id: 3 });
      (service as any).devicesRepository.save = jest.fn().mockResolvedValue({ id: 1 });
      const addDeviceDto4: AddDeviceDto = Object.assign(new AddDeviceDto(), {
        IMEI: '123',
        serial_number: 'SN',
        name: 'Device',
        type: 'TYPE',
      });
      const result = await service.addDevice(1, addDeviceDto4);
      expect(result).toEqual({ id: 1 });
    });
  });
});
