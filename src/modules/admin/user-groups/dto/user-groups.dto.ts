import { ApiProperty } from '@nestjs/swagger';

export class UserGroupsDto {
  @ApiProperty({
    description: 'The id of the user group',
    example: 1,
  })
  id: number;

  @ApiProperty({
    description: 'The name of the user group',
    example: 'Group 1',
  })
  name: string;

  @ApiProperty({
    description: 'The require point of the user group',
    example: 100,
    nullable: true,
  })
  require_point: number | null;

  @ApiProperty({
    description: 'The created at of the user group',
    example: '2021-01-01',
  })
  created_at: Date;

  @ApiProperty({
    description: 'The updated at of the user group',
    example: '2021-01-01',
  })
  updated_at: Date;
}
