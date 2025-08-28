import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AdminJwtAuthGuard } from '../auth/guards/admin.jwt-auth.guard';
import { AssignUserToGroupPayloadDto } from './dto/assign-user-to-group.payload';
import { AssignUserToGroupResponseDto } from './dto/assign-user-to-group.response.dto';
import { ListUserGroupsQueryDto } from './dto/list-user-groups.query.dto';
import { ListUserGroupsResponseDto } from './dto/list-user-groups.response.dto';
import { UserGroupAdminService } from './user-group.admin.service';

@ApiTags('Admin.UserGroups')
@Controller('admin/user-groups')
@ApiBearerAuth()
@UseGuards(AdminJwtAuthGuard)
export class UserGroupAdminController {
  constructor(private readonly userGroupAdminService: UserGroupAdminService) {}

  @Get()
  @ApiOperation({ summary: 'Get all user groups' })
  @ApiResponse({ type: ListUserGroupsResponseDto })
  async findAll(@Query() query: ListUserGroupsQueryDto): Promise<ListUserGroupsResponseDto> {
    return this.userGroupAdminService.findAll(query);
  }

  // @Post()
  // @ApiOperation({ summary: 'Create a user group' })
  // @ApiResponse({ type: UserGroupsDto })
  // async create(@Body() createUserGroupDto: CreateUserGroupPayloadDto): Promise<UserGroupsEntity> {
  //   return this.userGroupAdminService.create(createUserGroupDto);
  // }

  @Post('/assign')
  @ApiOperation({ summary: 'Assign a user group to a user' })
  @ApiResponse({ type: AssignUserToGroupResponseDto })
  async assignUserGroup(@Body() payload: AssignUserToGroupPayloadDto): Promise<AssignUserToGroupResponseDto> {
    await this.userGroupAdminService.assignUserGroup(payload);
    return {
      message: 'User assigned to group successfully',
    };
  }
}
