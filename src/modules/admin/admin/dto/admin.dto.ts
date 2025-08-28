import { ApiProperty } from '@nestjs/swagger';
import { Exclude, Expose } from 'class-transformer';
import { BaseEntity } from 'src/modules/typeorm/base.entity';

@Exclude()
export class AdminDto extends BaseEntity {
  @Expose()
  @ApiProperty({ description: 'Admin ID', example: 1 })
  id: number;

  @Expose()
  @ApiProperty({ description: 'Admin email', example: 'admin@example.com' })
  email: string;

  @Expose()
  @ApiProperty({ description: 'Admin avatar', example: 'https://example.com/avatar.png' })
  avatar: string;

  @Expose()
  @ApiProperty({ description: 'Admin name', example: 'John Doe' })
  name: string;
}
