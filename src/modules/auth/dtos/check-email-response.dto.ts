import { ApiProperty } from '@nestjs/swagger';

export class CheckEmailResponseDto {
  @ApiProperty({ example: true })
  exists: boolean;

  @ApiProperty({ example: 'Email đã tồn tại' })
  message: string;
}
