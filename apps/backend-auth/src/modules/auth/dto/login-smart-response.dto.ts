/**
 * Login Smart Response DTO
 *
 * Response for smart login endpoint.
 * Contains different fields based on number of organizations user belongs to.
 *
 * Case 1: Single organization
 *   - needsOrgSelection: false
 *   - accessToken, refreshToken, user present
 *   - organizations: undefined
 *
 * Case 2: Multiple organizations
 *   - needsOrgSelection: true
 *   - organizations: array of orgs
 *   - accessToken, refreshToken, user: undefined
 *
 * @module modules/auth/dto
 */

import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { UserDto } from './auth-response.dto';

/**
 * Organization summary for multi-org selection
 */
export class OrganizationSummaryDto {
  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'Organization ID',
  })
  id!: string;

  @ApiProperty({
    example: 'Sunshine Dental Group',
    description: 'Organization name',
  })
  name!: string;

  @ApiPropertyOptional({
    example: 'https://cdn.dentalos.com/logos/sunshine-dental.png',
    description: 'Organization logo URL',
  })
  logoUrl?: string;
}

/**
 * Response for smart login
 * FIX v8: Removed @Expose decorators to prevent automatic ClassSerializer stripping
 *
 * Security:
 * - When single org (needsOrgSelection=false), csrfToken is included for CSRF protection
 * - CSRF cookie is also set by the controller
 */
export class LoginSmartResponseDto {
  @ApiProperty({
    example: false,
    description: 'Whether user needs to select organization',
  })
  needsOrgSelection!: boolean;

  @ApiPropertyOptional({
    description: 'JWT access token (only if single org)',
  })
  accessToken?: string;

  @ApiPropertyOptional({
    description: 'JWT refresh token (only if single org)',
  })
  refreshToken?: string;

  @ApiPropertyOptional({
    description: 'User information (only if single org)',
    type: () => UserDto,
  })
  user?: UserDto;

  @ApiPropertyOptional({
    description:
      'CSRF token for protection against Cross-Site Request Forgery (only if single org). ' +
      'Must be included in X-CSRF-Token header for all state-changing requests.',
    example: 'a1b2c3d4e5f6789012345678901234567890abcdef1234567890abcdef12345678',
  })
  csrfToken?: string;

  @ApiPropertyOptional({
    description: 'List of organizations (only if multiple orgs)',
    type: [OrganizationSummaryDto],
  })
  organizations?: OrganizationSummaryDto[];
}
