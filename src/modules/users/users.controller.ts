import { Body, Controller, HttpStatus, Put, Request, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/shares/guards/jwt-auth.guard';
import { UpdateMeRequestDto } from './dtos/update-user-info-request.dto';
import { UsersService } from './users.service';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { UserResponseDto } from './dtos/user-response.dto';
import { plainToInstance } from 'class-transformer';
import { HeightUnit } from './users.constants';
import { cmToFeetInch } from '../../shares/helpers/utils';

@Controller('users')
@ApiTags('Users')
@ApiBearerAuth()
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Put('')
  @UseGuards(JwtAuthGuard)
  @ApiBody({
    type: UpdateMeRequestDto,
  })
  @ApiOperation({
    operationId: 'User.UpdateProfile',
    description: 'User update profile',
  })
  @ApiResponse({
    type: UserResponseDto,
    status: HttpStatus.OK,
    description: 'Successful',
  })
  async updateMe(@Request() req, @Body() body: UpdateMeRequestDto): Promise<UserResponseDto> {
    const userId = req.user?.id;
    const updatedUser = await this.usersService.updateMe(userId, body);

    // Convert height_cm to height_ft and height_in if height_unit is 'ft/in'
    let height_ft: any,
      height_in: any = null;
    if (updatedUser.height_unit === HeightUnit.FT_IN && updatedUser.height_cm) {
      const { feet, inches } = cmToFeetInch(updatedUser.height_cm);
      height_ft = feet;
      height_in = inches;
    }

    return plainToInstance(
      UserResponseDto,
      {
        ...updatedUser,
        height_ft,
        height_in,
      },
      { excludeExtraneousValues: true },
    );
  }
}
