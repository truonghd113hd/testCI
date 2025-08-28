import { ApiProperty } from '@nestjs/swagger';
import { UserGender, UserStatus } from '../users.constants';

export class UserDto {
  @ApiProperty({
    description: 'The id of the user',
    example: 1,
  })
  id: number;

  @ApiProperty({
    description: 'The email of the user',
    example: 'test@example.com',
  })
  email: string;

  @ApiProperty({
    description: 'The status of the user',
    example: UserStatus.ACTIVE,
  })
  status: UserStatus;

  @ApiProperty({
    description: 'The first name of the user',
    example: 'test',
  })
  first_name: string;

  @ApiProperty({
    description: 'The last name of the user',
    example: 'test',
  })
  last_name: string;

  @ApiProperty({
    description: 'The avatar of the user',
    example: 'https://example.com/avatar.png',
  })
  avatar: string;

  @ApiProperty({
    description: 'The date of birth of the user',
    example: '2021-01-01',
  })
  date_of_birth: Date;

  @ApiProperty({
    description: 'The gender of the user',
    example: UserGender.MALE,
  })
  gender: UserGender;

  @ApiProperty({
    description: 'The coin of the user',
    example: 100,
  })
  coin: number;

  @ApiProperty({
    description: 'The user group of the user',
    example: 1,
  })
  user_group_id: number;

  @ApiProperty({
    description: 'The user group name of the user',
    example: 'Group 1',
  })
  user_group_name: string;
}
