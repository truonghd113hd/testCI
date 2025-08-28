import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AdminService } from './admin.service';
import { plainToInstance } from 'class-transformer';
import { AdminDto } from './dto/admin.dto';
import { User } from 'src/shares/decorators/user.decorator';
import { UserProperties } from 'src/shares/constants/constant';
import { AdminJwtAuthGuard } from '../auth/guards/admin.jwt-auth.guard';

@Controller('admin')
@ApiBearerAuth()
@UseGuards(AdminJwtAuthGuard)
@ApiTags('Admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('me')
  async me(@User(UserProperties.USER_ID) id: number): Promise<AdminDto> {
    const res = await this.adminService.findById(id);
    return plainToInstance(AdminDto, res);
  }
}
