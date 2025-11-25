import { ApiProperty } from '@nestjs/swagger';
import { AddressDto } from '../common';
import { ClinicStatus } from './update-clinic.dto';

/**
 * Clinic response DTO
 */
export class ClinicResponseDto {
  @ApiProperty({
    description: 'Unique clinic identifier',
    example: '550e8400-e29b-41d4-a716-446655440000',
    format: 'uuid',
  })
  id!: string;

  @ApiProperty({
    description: 'Organization ID that owns this clinic',
    example: '550e8400-e29b-41d4-a716-446655440001',
    format: 'uuid',
  })
  organizationId!: string;

  @ApiProperty({
    description: 'Clinic name',
    example: 'Smile Dental - Downtown',
  })
  name!: string;

  @ApiProperty({
    description: 'Unique clinic code',
    example: 'SDG-DT-001',
  })
  code!: string;

  @ApiProperty({
    description: 'Current clinic status',
    enum: ClinicStatus,
    example: ClinicStatus.ACTIVE,
  })
  status!: ClinicStatus;

  @ApiProperty({
    description: 'Clinic address',
    type: () => AddressDto,
  })
  address!: AddressDto;

  @ApiProperty({
    description: 'Clinic phone number',
    example: '+1-415-555-1000',
  })
  phone!: string;

  @ApiProperty({
    description: 'Clinic email',
    example: 'downtown@smiledental.com',
  })
  email!: string;

  @ApiProperty({
    description: 'Clinic website',
    example: 'https://downtown.smiledental.com',
    required: false,
  })
  website?: string;

  @ApiProperty({
    description: 'Clinic manager user ID',
    example: '550e8400-e29b-41d4-a716-446655440002',
    required: false,
  })
  managerUserId?: string;

  @ApiProperty({
    description: 'Clinic manager name',
    example: 'Dr. Emily Rodriguez',
    required: false,
  })
  managerName?: string;

  @ApiProperty({
    description: 'Clinic manager email',
    example: 'emily.rodriguez@smiledental.com',
    required: false,
  })
  managerEmail?: string;

  @ApiProperty({
    description: 'IANA timezone',
    example: 'America/New_York',
  })
  timezone!: string;

  @ApiProperty({
    description: 'Locale code',
    example: 'en-US',
  })
  locale!: string;

  @ApiProperty({
    description: 'Operating hours',
    example: {
      monday: { open: '09:00', close: '17:00' },
      tuesday: { open: '09:00', close: '17:00' },
      wednesday: { open: '09:00', close: '17:00' },
      thursday: { open: '09:00', close: '17:00' },
      friday: { open: '09:00', close: '17:00' },
    },
    required: false,
  })
  operatingHours?: any;

  @ApiProperty({
    description: 'Dental license number',
    example: 'DL-CA-123456',
    required: false,
  })
  licenseNumber?: string;

  @ApiProperty({
    description: 'Accreditation details',
    example: 'ADA Accredited, ISO 9001:2015 Certified',
    required: false,
  })
  accreditationDetails?: string;

  @ApiProperty({
    description: 'User ID who created the clinic',
    example: '550e8400-e29b-41d4-a716-446655440003',
  })
  createdBy!: string;

  @ApiProperty({
    description: 'User ID who last updated the clinic',
    example: '550e8400-e29b-41d4-a716-446655440004',
  })
  updatedBy!: string;

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
