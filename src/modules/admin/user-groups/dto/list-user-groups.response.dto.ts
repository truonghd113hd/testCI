import { PaginationResponseDto } from 'src/shares/pagination/pagination.dto';
import { UserGroupsDto } from './user-groups.dto';
import { ApiProperty } from '@nestjs/swagger';
import { UserGroupNameEnum } from '../user-group.const';

export class ListUserGroupsResponseDto extends PaginationResponseDto<UserGroupsDto> {
  @ApiProperty({
    description: 'The user groups',
    type: [UserGroupsDto],
    example: [
      {
        id: 1,
        name: UserGroupNameEnum.WALLET_WARMUP,
        require_point: 0,
        total_users: 10,
        created_at: '2021-01-01',
        updated_at: '2021-01-01',
      },
    ],
  })
  declare data: UserGroupsDto[];
}
