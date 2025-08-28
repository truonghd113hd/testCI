import { Test, TestingModule } from '@nestjs/testing';
import { UserGroupAdminController } from 'src/modules/admin/user-groups/user-group.admin.controller';
import { UserGroupAdminService } from 'src/modules/admin/user-groups/user-group.admin.service';

const mockUserGroupAdminService = {
  findAll: jest.fn(),
  assignUserGroup: jest.fn(),
};

describe('UserGroupAdminController', () => {
  let controller: UserGroupAdminController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserGroupAdminController],
      providers: [{ provide: UserGroupAdminService, useValue: mockUserGroupAdminService }],
    }).compile();

    controller = module.get<UserGroupAdminController>(UserGroupAdminController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  // Add more tests here
});
