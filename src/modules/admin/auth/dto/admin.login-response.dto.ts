import { ApiProperty } from '@nestjs/swagger';
import { Exclude, Expose } from 'class-transformer';
import { AdminDto } from '../../admin/dto/admin.dto';

@Exclude()
export class AdminLoginResponseDto {
  @Expose()
  @ApiProperty({
    type: AdminDto,
    description: 'Admin info',
  })
  user: AdminDto;

  @Expose()
  @ApiProperty({
    type: String,
    description: 'Access token',
  })
  access_token: string;

  @Expose()
  @ApiProperty({
    type: String,
    description: 'Refresh token',
  })
  refresh_token: string;
}
