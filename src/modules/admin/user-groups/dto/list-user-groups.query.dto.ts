import { PaginationDto } from 'src/shares/pagination/pagination.dto';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { UserGroupSortBy } from '../user-group.const';

export class ListUserGroupsQueryDto extends PaginationDto {
  @ApiPropertyOptional({
    description: 'The name of the user group',
    example: 'Wallet Warm-up: Khởi động ví',
  })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({
    description: 'The order by of the user group',
    example: 'name',
    enum: UserGroupSortBy,
  })
  @IsOptional()
  @IsEnum(UserGroupSortBy)
  sortBy?: UserGroupSortBy;
}
