import { ApiProperty } from '@nestjs/swagger';
import { UserDto } from '../../../../modules/users/dtos/user.dto';
import { UserGender, UserStatus } from '../../../../modules/users/users.constants';
import { PaginationResponseDto } from '../../../../shares/pagination/pagination.dto';

export class ListUserResponseDto extends PaginationResponseDto<UserDto> {
  @ApiProperty({
    type: [UserDto],
    description: 'Array of users',
    example: [
      {
        id: 1,
        email: 'test@example.com',
        status: UserStatus.ACTIVE,
        first_name: 'test',
        last_name: 'test',
        avatar: 'https://example.com/avatar.png',
        date_of_birth: '2021-01-01',
        gender: UserGender.MALE,
        age: 20,
        weight: 70,
        height: 170,
        coin: 100,
        user_group_id: 1,
        user_group_name: 'Group 1',
        device_id: 1,
        device_name: 'Device 1',
      },
    ],
  })
  declare data: UserDto[];
}
