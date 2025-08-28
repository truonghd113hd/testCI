import { Test, TestingModule } from '@nestjs/testing';
import { DevicesController } from 'src/modules/devices/devices.controller';
import { DevicesService } from 'src/modules/devices/devices.service';
import { DeviceType } from 'src/modules/devices/types/devices.type';
import { AddDeviceDto } from 'src/modules/devices/dto/add-device.dto';
import { ListDevicesQueryDto } from 'src/modules/devices/dto/list-devices.query.dto';

// Mock DevicesService
const mockDevicesService = {
  getDevicesByUserId: jest.fn(),
  addDevice: jest.fn(),
  connectDevice: jest.fn(),
  syncDeviceData: jest.fn(),
};

describe('DevicesController', () => {
  let controller: DevicesController;
  let devicesService: typeof mockDevicesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DevicesController],
      providers: [{ provide: DevicesService, useValue: mockDevicesService }],
    }).compile();
    controller = module.get<DevicesController>(DevicesController);
    devicesService = module.get(DevicesService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAll', () => {
    it('should call service and return result', async () => {
      const userId = 1;
      const query: ListDevicesQueryDto = {
        page: 1,
        perPage: 10,
        userId: 1,
        name: undefined,
        status: undefined,
        serialNumber: undefined,
      };
      devicesService.getDevicesByUserId.mockResolvedValue({ data: [], metadata: { page: 1 } });
      const result = await controller.findAll(userId, query);
      expect(devicesService.getDevicesByUserId).toHaveBeenCalledWith(userId, query);
      expect(result).toEqual({ data: [], metadata: { page: 1 } });
    });
    it('should throw error if service throws', async () => {
      const userId = 1;
      const query: ListDevicesQueryDto = {
        page: 1,
        perPage: 10,
        userId: 1,
        name: undefined,
        status: undefined,
        serialNumber: undefined,
      };
      devicesService.getDevicesByUserId.mockRejectedValue(new Error('Service error'));
      await expect(controller.findAll(userId, query)).rejects.toThrow('Service error');
    });
  });

  describe('addDevice', () => {
    it('should call service and return result', async () => {
      const userId = 1;
      const dto: AddDeviceDto = { name: 'Device', serial_number: 'SN1', IMEI: 'IMEI1', type: DeviceType.SY01 };
      const result = { id: 1, ...dto };
      devicesService.addDevice.mockResolvedValue(result);
      const response = await controller.addDevice(userId, dto);
      expect(devicesService.addDevice).toHaveBeenCalledWith(userId, dto);
      expect(response).toEqual(result);
    });
    it('should throw error if service throws', async () => {
      const userId = 1;
      const dto: AddDeviceDto = { name: 'Device', serial_number: 'SN1', IMEI: 'IMEI1', type: DeviceType.SY01 };
      devicesService.addDevice.mockRejectedValue(new Error('Add error'));
      await expect(controller.addDevice(userId, dto)).rejects.toThrow('Add error');
    });
  });

  describe('connectDevice', () => {
    it('should call service and return result', async () => {
      const userId = 1;
      const deviceId = 2;
      const result = { id: deviceId, status: 'connected' };
      devicesService.connectDevice.mockResolvedValue(result);
      const response = await controller.connectDevice(userId, deviceId);
      expect(devicesService.connectDevice).toHaveBeenCalledWith(userId, deviceId);
      expect(response).toEqual(result);
    });
    it('should throw error if service throws', async () => {
      const userId = 1;
      const deviceId = 2;
      devicesService.connectDevice.mockRejectedValue(new Error('Connect error'));
      await expect(controller.connectDevice(userId, deviceId)).rejects.toThrow('Connect error');
    });
  });

  describe('syncDeviceData', () => {
    it('should call service and return result', async () => {
      const userId = 1;
      const deviceId = 2;
      const dto = { steps: 100 };
      const result = { synced: true };
      devicesService.syncDeviceData.mockResolvedValue(result);
      const response = await controller.syncDeviceData(userId, deviceId, dto);
      expect(devicesService.syncDeviceData).toHaveBeenCalledWith(userId, deviceId, dto);
      expect(response).toEqual(result);
    });
    it('should throw error if service throws', async () => {
      const userId = 1;
      const deviceId = 2;
      const dto = { steps: 100 };
      devicesService.syncDeviceData.mockRejectedValue(new Error('Sync error'));
      await expect(controller.syncDeviceData(userId, deviceId, dto)).rejects.toThrow('Sync error');
    });
  });

  it('addDevice should call service and return result', async () => {
    const userId = 1;
    const dto: AddDeviceDto = {
      name: 'Device',
      serial_number: 'SN1',
      IMEI: 'IMEI1',
      type: DeviceType.SY01,
    };
    devicesService.addDevice.mockResolvedValue({ id: 1 });
    const result = await controller.addDevice(userId, dto);
    expect(devicesService.addDevice).toHaveBeenCalledWith(userId, dto);
    expect(result).toEqual({ id: 1 });
  });

  it('connectDevice should call service and return result', async () => {
    const userId = 1;
    const deviceId = 2;
    devicesService.connectDevice.mockResolvedValue({ id: 2, status: 'connected' });
    const result = await controller.connectDevice(userId, deviceId);
    expect(devicesService.connectDevice).toHaveBeenCalledWith(userId, deviceId);
    expect(result).toEqual({ id: 2, status: 'connected' });
  });

  it('syncDeviceData should call service and return result', async () => {
    const userId = 1;
    const deviceId = 2;
    const dto = { steps: 100 };
    devicesService.syncDeviceData.mockResolvedValue({ id: 1 });
    const result = await controller.syncDeviceData(userId, deviceId, dto);
    expect(devicesService.syncDeviceData).toHaveBeenCalledWith(userId, deviceId, dto);
    expect(result).toEqual({ id: 1 });
  });
});
