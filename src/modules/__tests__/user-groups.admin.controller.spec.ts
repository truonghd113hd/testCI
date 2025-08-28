import { Test, TestingModule } from '@nestjs/testing';
import { UserGroupAdminController } from 'src/modules/admin/user-groups/user-group.admin.controller';
import { UserGroupAdminService } from 'src/modules/admin/user-groups/user-group.admin.service';

describe('UserGroupAdminController', () => {
  let controller: UserGroupAdminController;
  let service: UserGroupAdminService;

  const mockService = {
    findAll: jest.fn(),
    assignUserGroup: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserGroupAdminController],
      providers: [{ provide: UserGroupAdminService, useValue: mockService }],
    }).compile();
    controller = module.get<UserGroupAdminController>(UserGroupAdminController);
    service = module.get(UserGroupAdminService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('findAll should call service and return result', async () => {
    const query = { page: 1, perPage: 10 };
    const result = { data: [], metadata: { page: 1 } };
    mockService.findAll.mockResolvedValue(result);
    const response = await controller.findAll(query as any);
    expect(mockService.findAll).toHaveBeenCalledWith(query);
    expect(response).toEqual(result);
  });

  it('assignUserGroup should call service and return message', async () => {
    const payload = { user_group_id: 1, user_id: 2 };
    mockService.assignUserGroup.mockResolvedValue(undefined);
    const response = await controller.assignUserGroup(payload as any);
    expect(mockService.assignUserGroup).toHaveBeenCalledWith(payload);
    expect(response).toEqual({ message: 'User assigned to group successfully' });
  });
});
