/**
 * Login Response DTOs
 *
 * Data transfer objects for login endpoint response.
 * Supports both direct login (single cabinet) and cabinet selection flow (multiple cabinets).
 *
 * Flow scenarios:
 * 1. User has NO cabinets → auto-assign to default cabinet → return tokens
 * 2. User has ONE cabinet → return tokens immediately
 * 3. User has MULTIPLE cabinets → return cabinet list for selection
 *
 * @module modules/auth/dto
 */

import { ApiProperty } from '@nestjs/swagger';
import { UserDto } from './auth-response.dto';
import { CabinetSummaryDto } from './cabinet-summary.dto';

/**
 * Login response when user needs to select a cabinet
 * Used when user has multiple cabinet assignments
 */
export class LoginResponseDto {
  @ApiProperty({
    description: 'Whether cabinet selection is required',
    example: false,
  })
  requiresCabinetSelection!: boolean;

  @ApiProperty({
    description: 'List of cabinets user can select from (only if requiresCabinetSelection is true)',
    type: [CabinetSummaryDto],
    required: false,
  })
  cabinets?: CabinetSummaryDto[];

  @ApiProperty({
    description: 'JWT access token (only if requiresCabinetSelection is false)',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    required: false,
  })
  accessToken?: string;

  @ApiProperty({
    description: 'JWT refresh token (only if requiresCabinetSelection is false)',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    required: false,
  })
  refreshToken?: string;

  @ApiProperty({
    description: 'Token type (only if requiresCabinetSelection is false)',
    example: 'Bearer',
    required: false,
  })
  tokenType?: string;

  @ApiProperty({
    description: 'Access token expiration in seconds (only if requiresCabinetSelection is false)',
    example: 900,
    required: false,
  })
  expiresIn?: number;

  @ApiProperty({
    description: 'Authenticated user information',
    type: UserDto,
  })
  user!: UserDto;
}
