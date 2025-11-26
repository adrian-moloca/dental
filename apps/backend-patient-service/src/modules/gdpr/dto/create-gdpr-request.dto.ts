/**
 * GDPR Request DTOs
 *
 * Data transfer objects for GDPR compliance operations.
 *
 * @module modules/gdpr/dto
 */

import { IsString, IsNotEmpty, IsEnum, IsOptional, MaxLength, IsBoolean } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/**
 * Create GDPR Access Request DTO
 *
 * Initiates a data subject access request (Right to Access)
 */
export class CreateAccessRequestDto {
  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  @MaxLength(2000)
  notes?: string;

  @ApiPropertyOptional({ default: 'json', enum: ['json', 'pdf', 'zip'] })
  @IsEnum(['json', 'pdf', 'zip'])
  @IsOptional()
  format?: 'json' | 'pdf' | 'zip';
}

/**
 * Create GDPR Erasure Request DTO
 *
 * Initiates a data subject erasure request (Right to be Forgotten)
 */
export class CreateErasureRequestDto {
  @ApiProperty({
    enum: ['pseudonymization', 'full_deletion'],
    description:
      'pseudonymization: Anonymize PII but retain clinical data (default for Romanian law compliance)',
  })
  @IsEnum(['pseudonymization', 'full_deletion'])
  @IsNotEmpty()
  erasureMethod!: 'pseudonymization' | 'full_deletion';

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  @MaxLength(2000)
  notes?: string;

  @ApiPropertyOptional({
    description: 'Confirm understanding that clinical data will be retained for 10 years',
  })
  @IsBoolean()
  @IsOptional()
  acknowledgeRetention?: boolean;
}

/**
 * Create GDPR Portability Request DTO
 *
 * Initiates a data portability request (Right to Data Portability)
 */
export class CreatePortabilityRequestDto {
  @ApiPropertyOptional({ default: 'json', enum: ['json', 'pdf'] })
  @IsEnum(['json', 'pdf'])
  @IsOptional()
  format?: 'json' | 'pdf';

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  @MaxLength(2000)
  notes?: string;
}

/**
 * Process GDPR Request DTO
 *
 * Used by admin/staff to process a pending GDPR request
 */
export class ProcessGdprRequestDto {
  @ApiProperty({ enum: ['approve', 'reject'] })
  @IsEnum(['approve', 'reject'])
  @IsNotEmpty()
  action!: 'approve' | 'reject';

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  @MaxLength(2000)
  notes?: string;

  @ApiPropertyOptional({
    description: 'Required if action is reject',
  })
  @IsString()
  @IsOptional()
  @MaxLength(2000)
  rejectionReason?: string;
}

/**
 * Query GDPR Requests DTO
 *
 * Filter and pagination for listing GDPR requests
 */
export class QueryGdprRequestsDto {
  @ApiPropertyOptional({ enum: ['access', 'erasure', 'portability'] })
  @IsEnum(['access', 'erasure', 'portability'])
  @IsOptional()
  requestType?: 'access' | 'erasure' | 'portability';

  @ApiPropertyOptional({ enum: ['pending', 'in_progress', 'completed', 'rejected'] })
  @IsEnum(['pending', 'in_progress', 'completed', 'rejected'])
  @IsOptional()
  status?: 'pending' | 'in_progress' | 'completed' | 'rejected';

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  patientId?: string;

  @ApiPropertyOptional({ default: 1 })
  @IsOptional()
  page?: number;

  @ApiPropertyOptional({ default: 20 })
  @IsOptional()
  limit?: number;
}
