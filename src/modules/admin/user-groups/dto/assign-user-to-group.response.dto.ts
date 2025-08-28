import { ApiProperty } from '@nestjs/swagger';
import { User } from 'src/modules/users/entities/users.entity';

export class AssignUserToGroupResponseDto {
  @ApiProperty({ type: String, example: 'User assigned to group successfully' })
  message: string;
}
