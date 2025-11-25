import { ApiProperty } from '@nestjs/swagger';

/**
 * Standard success response wrapper
 */
export class SuccessResponseDto<T = unknown> {
  @ApiProperty({
    description: 'Indicates the request was successful',
    example: true,
  })
  success!: boolean;

  @ApiProperty({
    description: 'Response data',
  })
  data!: T;

  @ApiProperty({
    description: 'Timestamp of the response',
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
