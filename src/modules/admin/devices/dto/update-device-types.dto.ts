import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString } from 'class-validator';

export class UpdateDeviceTypesDto {
  @ApiPropertyOptional({ description: 'Device type name', example: 'RM01' })
  @IsString()
  @IsOptional()
  name: string;

  @ApiPropertyOptional({ description: 'Device type bonus percentage', example: 10 })
  @IsNumber()
  @IsOptional()
  bonusPercentage: number;

  @ApiPropertyOptional({ description: 'Device type steps per point', example: 100 })
  @IsNumber()
  @IsOptional()
  stepsPerPoint: number;
}
