import { applyDecorators, HttpStatus } from '@nestjs/common';
import { ApiPropertyOptional, ApiResponse } from '@nestjs/swagger';

export class ErrorResponse {
  @ApiPropertyOptional({ type: Number })
  readonly status?: any;
  @ApiPropertyOptional({
    type: String,
    example: 'Error message',
    default: 'Internal Server Error',
  })
  readonly message?: any;
  @ApiPropertyOptional({ type: String, example: 'Error' })
  readonly name?: any;
}

export const CommonErrorResponses = () => {
  return applyDecorators(
    ApiResponse({
      status: HttpStatus.UNAUTHORIZED,
      description: 'Unauthorized',
      type: ErrorResponse,
    }),
    ApiResponse({
      status: HttpStatus.INTERNAL_SERVER_ERROR,
      description: 'Internal server error',
      type: ErrorResponse,
    }),
    ApiResponse({
      status: HttpStatus.SERVICE_UNAVAILABLE,
      description: 'Service unavailable',
      type: ErrorResponse,
    }),
  );
};
