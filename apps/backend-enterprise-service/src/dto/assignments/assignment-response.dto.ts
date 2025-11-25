import { ApiProperty } from '@nestjs/swagger';

/**
 * Provider-Clinic assignment response DTO
 */
export class AssignmentResponseDto {
  @ApiProperty({
    description: 'Unique assignment identifier',
    example: '550e8400-e29b-41d4-a716-446655440000',
    format: 'uuid',
  })
  id!: string;

  @ApiProperty({
    description: 'Organization ID',
    example: '550e8400-e29b-41d4-a716-446655440001',
    format: 'uuid',
  })
  organizationId!: string;

  @ApiProperty({
    description: 'Clinic ID',
    example: '550e8400-e29b-41d4-a716-446655440002',
    format: 'uuid',
  })
  clinicId!: string;

  @ApiProperty({
    description: 'Staff member ID',
    example: '550e8400-e29b-41d4-a716-446655440003',
    format: 'uuid',
  })
  staffId!: string;

  @ApiProperty({
    description: 'Provider roles at this clinic',
    example: ['DENTIST', 'CLINIC_MANAGER'],
    type: [String],
  })
  roles!: string[];

  @ApiProperty({
    description: 'Whether this is the primary clinic',
    example: true,
  })
  isPrimaryClinic!: boolean;

  @ApiProperty({
    description: 'Custom working hours override',
    example: {
      monday: { start: '08:00', end: '16:00' },
      wednesday: { start: '08:00', end: '16:00' },
      friday: { start: '08:00', end: '14:00' },
    },
    required: false,
  })
  workingHoursOverride?: any;

  @ApiProperty({
    description: 'Assignment status',
    example: 'ACTIVE',
  })
  status!: string;

  @ApiProperty({
    description: 'Assignment start date',
    example: '2025-01-01T00:00:00.000Z',
  })
  startDate!: string;

  @ApiProperty({
    description: 'Assignment end date (null if ongoing)',
    example: null,
    required: false,
  })
  endDate?: string | null;

  @ApiProperty({
    description: 'User ID who created the assignment',
    example: '550e8400-e29b-41d4-a716-446655440004',
  })
  createdBy!: string;

  @ApiProperty({
    description: 'Creation timestamp',
    example: '2025-01-01T00:00:00.000Z',
  })
  createdAt!: string;

  @ApiProperty({
    description: 'Last update timestamp',
    example: '2025-01-15T10:30:00.000Z',
  })
  updatedAt!: string;
}

/**
 * Clinic staff member summary
 */
export class ClinicStaffMemberDto {
  @ApiProperty({
    description: 'Staff member ID',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  staffId!: string;

  @ApiProperty({
    description: 'Staff member name',
    example: 'Dr. Sarah Johnson',
  })
  name!: string;

  @ApiProperty({
    description: 'Roles at this clinic',
    example: ['DENTIST'],
    type: [String],
  })
  roles!: string[];

  @ApiProperty({
    description: 'Whether this is their primary clinic',
    example: true,
  })
  isPrimaryClinic!: boolean;
}

/**
 * Provider clinic summary
 */
export class ProviderClinicDto {
  @ApiProperty({
    description: 'Clinic ID',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  clinicId!: string;

  @ApiProperty({
    description: 'Clinic name',
    example: 'Smile Dental - Downtown',
  })
  clinicName!: string;

  @ApiProperty({
    description: 'Provider roles at this clinic',
    example: ['DENTIST', 'CLINIC_MANAGER'],
    type: [String],
  })
  roles!: string[];

  @ApiProperty({
    description: 'Whether this is the primary clinic',
    example: true,
  })
  isPrimaryClinic!: boolean;
}
