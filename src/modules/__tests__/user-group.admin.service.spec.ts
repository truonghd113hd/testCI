import { Test, TestingModule } from '@nestjs/testing';
import { UserGroupAdminService } from 'src/modules/admin/user-groups/user-group.admin.service';
import { UserGroupsEntity } from 'src/modules/admin/user-groups/entities/user-groups.entity';
import { PaginationMetadataHelper } from 'src/shares/pagination/pagination.helper';
import { UserAdminService } from 'src/modules/admin/users/user.admin.service';
import { getRepositoryToken } from '@nestjs/typeorm';

const mockUserGroupsRepository = {};
const mockPaginationMetadataHelper = {};
const mockUserAdminService = {};

describe('UserGroupAdminService', () => {
  let service: UserGroupAdminService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserGroupAdminService,
        { provide: getRepositoryToken(UserGroupsEntity), useValue: mockUserGroupsRepository },
        { provide: PaginationMetadataHelper, useValue: mockPaginationMetadataHelper },
        { provide: UserAdminService, useValue: mockUserAdminService },
      ],
    }).compile();
    service = module.get<UserGroupAdminService>(UserGroupAdminService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // Add your tests here
});
