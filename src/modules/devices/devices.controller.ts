import { Body, Controller, Get, HttpStatus, Param, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { DevicesService } from './devices.service';
import { JwtAuthGuard } from '../../shares/guards/jwt-auth.guard';
import { CommonErrorResponses } from '../../shares/decorators/common-error-responses.decorator';
import { User } from '../../shares/decorators/user.decorator';
import { UserProperties } from '../../shares/constants/constant';
import { ListDevicesResponseDto } from './dto/list-devices.response.dto';
import { ListDevicesQueryDto } from './dto/list-devices.query.dto';
import { DeviceDto } from './dto/device.dto';
import { AddDeviceDto } from './dto/add-device.dto';
import { AddUserHealthMetricDto } from '../user-health-metric/dtos/add-user-health-metric.dto';

@Controller('devices')
@ApiTags('Devices')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
export class DevicesController {
  constructor(private readonly devicesService: DevicesService) {}

  @Get('')
  @ApiOperation({
    operationId: 'indexDevices',
    summary: 'Get all devices',
    description: 'Get all devices',
  })
  @ApiResponse({
    type: ListDevicesResponseDto,
    status: HttpStatus.OK,
    description: 'Successful',
  })
  @CommonErrorResponses()
  findAll(
    @User(UserProperties.USER_ID) userId: number,
    @Query() query: ListDevicesQueryDto,
  ): Promise<ListDevicesResponseDto> {
    return this.devicesService.getDevicesByUserId(userId, query);
  }

  @Post('')
  @ApiOperation({
    operationId: 'addDevice',
    summary: 'Add device',
    description: 'Add device',
  })
  @UseGuards(JwtAuthGuard)
  @ApiResponse({
    type: AddDeviceDto,
    status: HttpStatus.OK,
    description: 'Successful',
  })
  @CommonErrorResponses()
  addDevice(@User(UserProperties.USER_ID) userId: number, @Body() body: AddDeviceDto) {
    return this.devicesService.addDevice(userId, body);
  }

  @Post(':id/connect')
  @ApiOperation({
    operationId: 'connectDevice',
    summary: 'Connect device',
    description: 'Connect device',
  })
  @ApiResponse({
    type: DeviceDto,
    status: HttpStatus.OK,
    description: 'Successful',
  })
  @CommonErrorResponses()
  connectDevice(@User(UserProperties.USER_ID) userId: number, @Param('id') id: number) {
    return this.devicesService.connectDevice(userId, id);
  }

  @Post(':id/sync')
  @ApiOperation({
    operationId: 'syncDeviceData',
    summary: 'Sync device data',
    description: 'Sync device data',
  })
  @ApiResponse({
    type: DeviceDto,
    status: HttpStatus.OK,
    description: 'Successful',
  })
  @CommonErrorResponses()
  syncDeviceData(
    @User(UserProperties.USER_ID) userId: number,
    @Param('id') id: number,
    @Body() body: AddUserHealthMetricDto,
  ) {
    return this.devicesService.syncDeviceData(userId, id, body);
  }
}
