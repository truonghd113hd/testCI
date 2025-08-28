import { Test, TestingModule } from '@nestjs/testing';
import { UserAdminController } from '../admin/users/user.admin.controller';
import { UserAdminService } from '../admin/users/user.admin.service';

const mockUserAdminService = {
  findAll: jest.fn(),
};

describe('UserAdminController', () => {
  let controller: UserAdminController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserAdminController],
      providers: [{ provide: UserAdminService, useValue: mockUserAdminService }],
    }).compile();

    controller = module.get<UserAdminController>(UserAdminController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getUsers', () => {
    it('should call service and return result', async () => {
      const query = { page: 1, perPage: 10 };
      const result = { data: [], metadata: { page: 1 } };
      mockUserAdminService.findAll.mockResolvedValue(result);
      const response = await controller.getUsers(query as Record<string, unknown>);
      expect(mockUserAdminService.findAll).toHaveBeenCalledWith(query);
      expect(response).toEqual(result);
    });
    it('should throw error if service throws', async () => {
      const query = { page: 1, perPage: 10 };
      mockUserAdminService.findAll.mockRejectedValue(new Error('Service error'));
      await expect(controller.getUsers(query as Record<string, unknown>)).rejects.toThrow('Service error');
    });
  });
});
