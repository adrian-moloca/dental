/**
 * SessionDto - Session response for API clients
 *
 * Used by GET /auth/sessions endpoint to return list of active sessions.
 * Excludes sensitive data (token hashes) and masks IP addresses for GDPR compliance.
 *
 * Security & Privacy:
 * - No token hashes exposed
 * - IP addresses masked (last octet/group)
 * - Device info sanitized
 *
 * @module SessionDto
 */

import { ApiProperty } from '@nestjs/swagger';
import { UUID, OrganizationId, ClinicId } from '@dentalos/shared-types';

/**
 * Device information DTO (with masked IP)
 */
export class DeviceInfoDto {
  /**
   * Unique device identifier (SHA256 hash)
   * @example "a3f5b2c..."
   */
  @ApiProperty({
    description: 'Unique device identifier (hashed)',
    example: 'a3f5b2c8d4e1f9a7b6c5d4e3f2a1b0c9',
    type: String,
  })
  deviceId!: string;

  /**
   * Human-readable device name
   * @example "Chrome 120 on Ubuntu"
   */
  @ApiProperty({
    description: 'Human-readable device name',
    example: 'Chrome 120 on Ubuntu',
    type: String,
  })
  deviceName!: string;

  /**
   * Masked IP address (GDPR compliant)
   * @example "192.168.1.xxx"
   */
  @ApiProperty({
    description: 'Masked IP address (last octet hidden)',
    example: '192.168.1.xxx',
    type: String,
  })
  ipAddress!: string;

  /**
   * User agent string
   * @example "Mozilla/5.0..."
   */
  @ApiProperty({
    description: 'User agent string',
    example: 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36',
    type: String,
  })
  userAgent!: string;
}

/**
 * Session response DTO
 */
export class SessionDto {
  /**
   * Session unique identifier
   * @example "123e4567-e89b-12d3-a456-426614174001"
   */
  @ApiProperty({
    description: 'Session unique identifier',
    example: '123e4567-e89b-12d3-a456-426614174001',
    type: String,
    format: 'uuid',
  })
  id!: UUID;

  /**
   * User who owns this session
   * @example "123e4567-e89b-12d3-a456-426614174002"
   */
  @ApiProperty({
    description: 'User ID who owns this session',
    example: '123e4567-e89b-12d3-a456-426614174002',
    type: String,
    format: 'uuid',
  })
  userId!: UUID;

  /**
   * Organization this session belongs to
   * @example "123e4567-e89b-12d3-a456-426614174000"
   */
  @ApiProperty({
    description: 'Organization ID for tenant isolation',
    example: '123e4567-e89b-12d3-a456-426614174000',
    type: String,
    format: 'uuid',
  })
  organizationId!: OrganizationId;

  /**
   * Optional clinic context
   * @example "123e4567-e89b-12d3-a456-426614174003"
   */
  @ApiProperty({
    description: 'Optional clinic ID if session is clinic-scoped',
    example: '123e4567-e89b-12d3-a456-426614174003',
    type: String,
    format: 'uuid',
    required: false,
  })
  clinicId?: ClinicId;

  /**
   * Device metadata
   */
  @ApiProperty({
    description: 'Device information with masked IP',
    type: DeviceInfoDto,
  })
  deviceInfo!: DeviceInfoDto;

  /**
   * Session creation timestamp
   * @example "2025-11-20T10:30:00.000Z"
   */
  @ApiProperty({
    description: 'Session creation timestamp',
    example: '2025-11-20T10:30:00.000Z',
    type: String,
    format: 'date-time',
  })
  createdAt!: Date;

  /**
   * Session expiration timestamp
   * @example "2025-11-27T10:30:00.000Z"
   */
  @ApiProperty({
    description: 'Session expiration timestamp (7 days from creation)',
    example: '2025-11-27T10:30:00.000Z',
    type: String,
    format: 'date-time',
  })
  expiresAt!: Date;

  /**
   * Last activity timestamp
   * @example "2025-11-20T12:45:00.000Z"
   */
  @ApiProperty({
    description: 'Last activity timestamp (updated on token refresh)',
    example: '2025-11-20T12:45:00.000Z',
    type: String,
    format: 'date-time',
  })
  lastActivityAt!: Date;

  /**
   * Whether session is currently active
   * @example true
   */
  @ApiProperty({
    description: 'Whether session is active (not expired or revoked)',
    example: true,
    type: Boolean,
  })
  isActive!: boolean;

  /**
   * Whether this is the current session making the request
   * @example true
   */
  @ApiProperty({
    description: 'Whether this is the current session (request context)',
    example: true,
    type: Boolean,
  })
  isCurrent!: boolean;
}
