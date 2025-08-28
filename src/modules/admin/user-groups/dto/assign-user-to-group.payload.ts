import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber } from 'class-validator';

export class AssignUserToGroupPayloadDto {
  @ApiProperty({
    description: 'The user id',
    example: 1,
  })
  @IsNotEmpty()
  @IsNumber()
  user_id: number;

  @ApiProperty({
    description: 'The user group id',
    example: 1,
  })
  @IsNotEmpty()
  @IsNumber()
  user_group_id: number;
}
