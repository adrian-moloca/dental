/**
 * Select Organization DTO
 *
 * Data transfer object for organization selection during multi-org login.
 * Used when user belongs to multiple organizations and must choose one.
 *
 * Flow:
 * 1. User attempted login-smart
 * 2. Backend found user belongs to multiple orgs
 * 3. Frontend shows org selector
 * 4. User picks organization
 * 5. Frontend calls this endpoint with selection
 * 6. Backend validates user belongs to selected org
 * 7. Returns JWT scoped to that organization
 *
 * @module modules/auth/dto
 */

import { IsEmail, IsString, MinLength, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import type { OrganizationId } from '@dentalos/shared-types';

/**
 * DTO for selecting organization during login
 */
export class SelectOrgDto {
  @ApiProperty({
    example: 'user@dentalclinic.com',
    description: 'User email address',
  })
  @IsEmail({}, { message: 'Invalid email format' })
  email!: string;

  @ApiProperty({
    example: 'SecureP@ssw0rd123',
    description: 'User password',
  })
  @IsString()
  @MinLength(1, { message: 'Password is required' })
  password!: string;

  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'Selected organization ID',
  })
  @IsUUID('4', { message: 'Invalid organization ID format' })
  organizationId!: OrganizationId;
}
