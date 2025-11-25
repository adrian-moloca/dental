/**
 * Patient Registration DTO
 *
 * @module modules/auth/dto/register
 */

import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsString,
  MinLength,
  MaxLength,
  Matches,
  IsDateString,
  IsOptional,
} from 'class-validator';

export class PatientRegisterDto {
  @ApiProperty({
    example: 'john.doe@example.com',
    description: 'Patient email address',
  })
  @IsEmail()
  email!: string;

  @ApiProperty({
    example: 'SecurePass123!',
    description: 'Password (min 8 chars, must contain uppercase, lowercase, number, special char)',
    minLength: 8,
  })
  @IsString()
  @MinLength(8)
  @Matches(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
    {
      message:
        'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character',
    },
  )
  password!: string;

  @ApiProperty({ example: 'John', description: 'First name' })
  @IsString()
  @MinLength(1)
  @MaxLength(50)
  firstName!: string;

  @ApiProperty({ example: 'Doe', description: 'Last name' })
  @IsString()
  @MinLength(1)
  @MaxLength(50)
  lastName!: string;

  @ApiProperty({ example: '+1234567890', description: 'Phone number' })
  @IsString()
  @Matches(/^\+?[1-9]\d{1,14}$/, {
    message: 'Phone number must be in E.164 format',
  })
  phoneNumber!: string;

  @ApiProperty({ example: '1990-01-01', description: 'Date of birth (ISO 8601)' })
  @IsDateString()
  dateOfBirth!: string;

  @ApiProperty({ example: 'tenant-123', description: 'Tenant ID' })
  @IsString()
  tenantId!: string;

  @ApiProperty({ example: 'org-456', description: 'Organization ID', required: false })
  @IsOptional()
  @IsString()
  organizationId?: string;

  @ApiProperty({ example: 'clinic-789', description: 'Clinic ID', required: false })
  @IsOptional()
  @IsString()
  clinicId?: string;
}
