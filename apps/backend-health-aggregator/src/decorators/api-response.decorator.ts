import { applyDecorators } from '@nestjs/common';
import { ApiResponse, ApiResponseOptions } from '@nestjs/swagger';

/**
 * Standard API Response Decorator
 *
 * Combines common @ApiResponse decorators for consistent API documentation
 *
 * @param options - Additional ApiResponse options
 * @returns Combined decorator
 */
export function ApiStandardResponse(options?: ApiResponseOptions) {
  return applyDecorators(
    ApiResponse({
      status: 200,
      description: 'Request processed successfully',
      ...options,
    }),
    ApiResponse({
      status: 400,
      description: 'Bad Request - Invalid input data',
    }),
    ApiResponse({
      status: 500,
      description: 'Internal Server Error - Unexpected error occurred',
    }),
  );
}
