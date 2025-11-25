/**
 * Select Cabinet DTO
 *
 * Data transfer object for cabinet selection during login flow.
 * Used when user selects a specific cabinet after authentication.
 *
 * Flow:
 * 1. User authenticates with email/password
 * 2. System returns list of cabinets user has access to
 * 3. User selects a cabinet
 * 4. Frontend calls login-select-cabinet with cabinetId
 * 5. Backend validates access and returns JWT with cabinet context
 *
 * @module modules/auth/dto
 */

import { IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import type { UUID } from '@dentalos/shared-types';

/**
 * DTO for selecting cabinet during login
 */
export class SelectCabinetDto {
  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440003',
    description: 'Selected cabinet ID',
  })
  @IsUUID('4', { message: 'Invalid cabinet ID format' })
  cabinetId!: UUID;
}
