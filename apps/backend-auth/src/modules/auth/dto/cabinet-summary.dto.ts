/**
 * Cabinet Summary DTO
 *
 * Represents a cabinet available for user selection during login.
 * Contains minimal cabinet information needed for the user to make a choice.
 *
 * Used in login flow when user has multiple cabinet assignments.
 *
 * @module modules/auth/dto
 */

import { ApiProperty } from '@nestjs/swagger';
import type { UUID } from '@dentalos/shared-types';

/**
 * Cabinet summary for login selection
 * Contains basic cabinet info without sensitive details
 */
export class CabinetSummaryDto {
  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440003',
    description: 'Cabinet unique identifier',
  })
  id!: UUID;

  @ApiProperty({
    example: 'Main Office',
    description: 'Cabinet name',
  })
  name!: string;

  @ApiProperty({
    example: 'CAB-001',
    description: 'Cabinet code (optional)',
    required: false,
  })
  code?: string;

  @ApiProperty({
    example: true,
    description: 'Whether this is the primary cabinet for the user',
  })
  isPrimary!: boolean;

  @ApiProperty({
    example: '123 Main St, New York, NY 10001',
    description: 'Cabinet address (optional)',
    required: false,
  })
  address?: string;
}
