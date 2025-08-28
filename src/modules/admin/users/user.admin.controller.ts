import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AdminJwtAuthGuard } from '../auth/guards/admin.jwt-auth.guard';
import { FilterUserQueryDto, ListUserQueryDto } from './dto/list-user.query.dto';
import { ListUserResponseDto } from './dto/list-user.response.dto';
import { UserAdminService } from './user.admin.service';

@ApiTags('Admin.Users')
@ApiBearerAuth()
@UseGuards(AdminJwtAuthGuard)
@Controller('admin/users')
export class UserAdminController {
  constructor(private readonly userService: UserAdminService) {}

  @Get()
  @ApiQuery({
    name: 'filters',
    style: 'deepObject', // <-- important
    explode: true,
    type: FilterUserQueryDto,
    required: false,
  })
  @ApiOperation({ summary: 'Get users' })
  @ApiResponse({
    type: ListUserResponseDto,
    description: 'Get users',
  })
  async getUsers(@Query() query: ListUserQueryDto): Promise<ListUserResponseDto> {
    return this.userService.findAll(query);
  }
}
