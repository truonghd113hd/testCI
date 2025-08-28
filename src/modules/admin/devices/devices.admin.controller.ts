import { Body, Controller, Get, Param, Post, Put, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { DeviceDto } from 'src/modules/devices/dto/device.dto';
import { AdminJwtAuthGuard } from '../auth/guards/admin.jwt-auth.guard';
import { DevicesAdminService } from './devices.admin.service';
import { CreateDeviceTypesDto } from './dto/create-device-types.dto';
import { CreateDeviceDto } from './dto/create-device.dto';
import { DevicesTypeDto } from './dto/device-types.dto';
import { ListDeviceTypesQueryDto } from './dto/list-device-types.query.dto';
import { ListDeviceTypesResponseDto } from './dto/list-dvice-types.response.dto';
import { UpdateDeviceTypesDto } from './dto/update-device-types.dto';

@ApiTags('Admin.Devices')
@Controller('admin/devices')
@ApiBearerAuth()
@UseGuards(AdminJwtAuthGuard)
export class DevicesAdminController {
  constructor(private readonly devicesService: DevicesAdminService) {}

  @Get('/types')
  @ApiOperation({ summary: 'Get devices' })
  @ApiResponse({
    type: ListDeviceTypesResponseDto,
    description: 'Get devices',
  })
  async findAll(@Query() query: ListDeviceTypesQueryDto): Promise<ListDeviceTypesResponseDto> {
    return this.devicesService.findAll(query);
  }

  @Post('/types')
  @ApiOperation({ summary: 'Create device type' })
  @ApiResponse({
    type: DevicesTypeDto,
    description: 'Create device type',
  })
  async createDeviceType(@Body() dto: CreateDeviceTypesDto): Promise<DevicesTypeDto> {
    return this.devicesService.createDeviceType(dto);
  }

  @Put('/types/:id')
  @ApiOperation({ summary: 'Update device type' })
  @ApiResponse({
    type: DevicesTypeDto,
    description: 'Update device type',
  })
  async updateDeviceType(@Param('id') id: number, @Body() dto: UpdateDeviceTypesDto): Promise<DevicesTypeDto> {
    return this.devicesService.updateDeviceType(id, dto);
  }

  // @Post()
  // @ApiOperation({ summary: 'Create device' })
  // @ApiResponse({
  //   type: DeviceDto,
  //   description: 'Create device',
  // })
  // async createDevice(@Body() dto: CreateDeviceDto): Promise<DeviceDto> {
  //   return this.devicesService.createDevice(dto);
  // }
}
