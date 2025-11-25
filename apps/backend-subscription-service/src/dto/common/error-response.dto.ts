import { ApiProperty } from '@nestjs/swagger';

/**
 * Standard error response structure
 */
export class ErrorResponseDto {
  @ApiProperty({
    description: 'HTTP status code',
    example: 400,
  })
  statusCode!: number;

  @ApiProperty({
    description: 'Error message describing what went wrong',
    example: 'Validation failed',
  })
  message!: string;

  @ApiProperty({
    description: 'Detailed error information (only in development)',
    example: ['name must be a string', 'email must be a valid email'],
    required: false,
    type: [String],
  })
  errors?: string[];

  @ApiProperty({
    description: 'Request path that caused the error',
    example: '/api/v1/subscriptions',
    required: false,
  })
  path?: string;

  @ApiProperty({
    description: 'Timestamp of when the error occurred',
    example: '2025-01-24T10:30:00.000Z',
  })
  timestamp!: string;

  @ApiProperty({
    description: 'Correlation ID for tracing the request',
    example: 'abc123-def456-ghi789',
    required: false,
  })
  correlationId?: string;
}
