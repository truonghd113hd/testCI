import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsOptional } from 'class-validator';
import { createPagination, getEnumValues } from '../helpers/utils';
import { PaginationOrderBy } from './pagination.constant';
import { IPaginationMetadata } from './pagination.interface';

export class PaginationDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @ApiPropertyOptional({
    type: 'integer',
    description: 'Page number',
  })
  page?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @ApiPropertyOptional({
    type: 'integer',
    description: 'Display a limit per page',
  })
  perPage?: number;

  @IsOptional()
  @IsEnum(PaginationOrderBy)
  @ApiPropertyOptional({
    type: String,
    enum: getEnumValues(PaginationOrderBy),
    description: 'Order by',
    example: PaginationOrderBy.DESC,
  })
  orderBy?: PaginationOrderBy;
}

export class PaginationResponseDto<T> {
  @ApiProperty({
    type: 'array',
    description: 'Array of data items',
    example: [],
  })
  data: T[];

  @ApiProperty({
    type: 'object',
    description: 'Pagination metadata headers',
    example: {
      page: 1,
      total_count: 1,
      pages_count: 1,
      per_page: 1,
      next_page: 1,
    },
    additionalProperties: false,
  })
  metadata?: IPaginationMetadata;
}

export const Pagination = createParamDecorator((data, ctx: ExecutionContext) => {
  const req = ctx.switchToHttp().getRequest();
  return createPagination(req.query.page, req.query.perPage);
});
