import { IsInt, IsNumber, IsOptional, Min, Max } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AddUserHealthMetricDto {
  @ApiProperty({ example: 500, description: 'Active energy in kcal', required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  active_energy?: number;

  @ApiProperty({ example: 36.5, description: 'Body temperature in °C', required: false })
  @IsOptional()
  @IsNumber()
  @Min(30)
  @Max(45)
  body_temperature?: number;

  @ApiProperty({ example: 10.5, description: 'Cycling distance in km', required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  cycling_distance?: number;

  @ApiProperty({ example: 72, description: 'Heart rate in bpm', required: false })
  @IsOptional()
  @IsNumber()
  @Min(30)
  @Max(200)
  heart_rate?: number;

  @ApiProperty({ example: 170, description: 'Height in cm', required: false })
  @IsOptional()
  @IsNumber()
  @Min(50)
  @Max(250)
  height?: number;

  @ApiProperty({ example: 10000, description: 'Steps count', required: false })
  @IsOptional()
  @IsInt()
  @Min(0)
  steps?: number;

  @ApiProperty({ example: 5.2, description: 'Walking distance in km', required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  walking_distance?: number;

  @ApiProperty({ example: 3.1, description: 'Running distance in km', required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  running_distance?: number;

  @ApiProperty({ example: 70.5, description: 'Weight in kg', required: false })
  @IsOptional()
  @IsNumber()
  @Min(20)
  @Max(300)
  weight?: number;
}
