import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateUserGroupPayloadDto {
  @ApiProperty({
    description: 'The name of the user group',
    example: 'Group 1',
  })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({
    description: 'The require point of the user group',
    example: 100,
    nullable: true,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  require_point?: number | null;
}
