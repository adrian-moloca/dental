import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsOptional, Min, Max } from 'class-validator';

/**
 * Standard pagination query parameters
 */
export class PaginationDto {
  @ApiProperty({
    description: 'Maximum number of items to return',
    example: 20,
    default: 20,
    minimum: 1,
    maximum: 100,
    required: false,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 20;

  @ApiProperty({
    description: 'Number of items to skip (for pagination)',
    example: 0,
    default: 0,
    minimum: 0,
    required: false,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  offset?: number = 0;
}

/**
 * Standard paginated response wrapper
 */
export class PaginatedResponseDto<T> {
  @ApiProperty({
    description: 'Array of items in the current page',
  })
  data!: T[];

  @ApiProperty({
    description: 'Total number of items across all pages',
    example: 150,
  })
  total!: number;

  @ApiProperty({
    description: 'Number of items in the current page',
    example: 20,
  })
  count!: number;

  @ApiProperty({
    description: 'Number of items requested per page',
    example: 20,
  })
  limit!: number;

  @ApiProperty({
    description: 'Number of items skipped',
    example: 0,
  })
  offset!: number;

  @ApiProperty({
    description: 'Whether there are more items available',
    example: true,
  })
  hasMore!: boolean;
}
