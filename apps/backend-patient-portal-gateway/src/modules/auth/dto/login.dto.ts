/**
 * Patient Login DTO
 *
 * @module modules/auth/dto/login
 */

import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength } from 'class-validator';

export class PatientLoginDto {
  @ApiProperty({
    example: 'john.doe@example.com',
    description: 'Patient email address',
  })
  @IsEmail()
  email!: string;

  @ApiProperty({
    example: 'SecurePass123!',
    description: 'Password',
  })
  @IsString()
  @MinLength(1)
  password!: string;

  @ApiProperty({ example: 'tenant-123', description: 'Tenant ID' })
  @IsString()
  tenantId!: string;
}
