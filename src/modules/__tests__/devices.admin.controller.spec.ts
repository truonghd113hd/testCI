import { Test, TestingModule } from '@nestjs/testing';
import { DevicesAdminController } from '../admin/devices/devices.admin.controller';
import { DevicesAdminService } from '../admin/devices/devices.admin.service';

// Mock DevicesAdminService
const mockDevicesAdminService = {
  findAll: jest.fn(),
  createDeviceType: jest.fn(),
  updateDeviceType: jest.fn(),
};

describe('DevicesAdminController', () => {
  let controller: DevicesAdminController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DevicesAdminController],
      providers: [{ provide: DevicesAdminService, useValue: mockDevicesAdminService }],
    }).compile();

    controller = module.get<DevicesAdminController>(DevicesAdminController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAll', () => {
    it('should call devicesService.findAll and return result', async () => {
      const query = { page: 1, perPage: 10, search: '', sortBy: undefined };
      const result = { data: [], metadata: {} };
      mockDevicesAdminService.findAll.mockResolvedValue(result);
      const response = await controller.findAll(query);
      expect(mockDevicesAdminService.findAll).toHaveBeenCalledWith(query);
      expect(response).toEqual(result);
    });
  });

  describe('createDeviceType', () => {
    it('should call devicesService.createDeviceType and return result', async () => {
      const dto = { name: 'Type A', bonusPercentage: 10, stepsPerPoint: 100 };
      const result = { id: 1, ...dto };
      mockDevicesAdminService.createDeviceType.mockResolvedValue(result);
      const response = await controller.createDeviceType(dto);
      expect(mockDevicesAdminService.createDeviceType).toHaveBeenCalledWith(dto);
      expect(response).toEqual(result);
    });
  });

  describe('updateDeviceType', () => {
    it('should call devicesService.updateDeviceType and return result', async () => {
      const id = 1;
      const dto = { name: 'Type B', bonusPercentage: 20, stepsPerPoint: 200 };
      const result = { id, ...dto };
      mockDevicesAdminService.updateDeviceType.mockResolvedValue(result);
      const response = await controller.updateDeviceType(id, dto);
      expect(mockDevicesAdminService.updateDeviceType).toHaveBeenCalledWith(id, dto);
      expect(response).toEqual(result);
    });
  });
});
