import { ApiProperty } from '@nestjs/swagger';
import { IsDate, IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class DevicesTypeDto {
  @ApiProperty({ description: 'Device type name', example: 'RM01' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ description: 'Device type bonus percentage', example: 10 })
  @IsNumber()
  @IsNotEmpty()
  bonusPercentage: number;

  @ApiProperty({ description: 'Device type steps per point', example: 100 })
  @IsNumber()
  @IsNotEmpty()
  stepsPerPoint: number;

  @ApiProperty({ description: 'Device type created at', example: '2021-01-01' })
  @IsDate()
  @IsNotEmpty()
  created_at: Date;

  @ApiProperty({ description: 'Device type updated at', example: '2021-01-01' })
  @IsDate()
  @IsNotEmpty()
  updated_at: Date;
}
