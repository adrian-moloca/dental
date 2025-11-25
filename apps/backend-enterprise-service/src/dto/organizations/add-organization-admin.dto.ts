import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsEmail, IsEnum, IsNotEmpty, IsUUID, MaxLength } from 'class-validator';

/**
 * Enterprise role types for organization administrators
 */
export enum EnterpriseRole {
  ORG_ADMIN = 'ORG_ADMIN',
  ORG_MANAGER = 'ORG_MANAGER',
  MULTI_CLINIC_MANAGER = 'MULTI_CLINIC_MANAGER',
  AUDITOR = 'AUDITOR',
  SYSTEM_OWNER = 'SYSTEM_OWNER',
}

/**
 * DTO for adding an administrator to an organization
 */
export class AddOrganizationAdminDto {
  @ApiProperty({
    description: 'UUID of the user to add as an administrator',
    example: '550e8400-e29b-41d4-a716-446655440000',
    format: 'uuid',
  })
  @IsUUID()
  @IsNotEmpty()
  userId!: string;

  @ApiProperty({
    description: 'Email address of the administrator',
    example: 'admin@smiledental.com',
  })
  @IsEmail()
  @IsNotEmpty()
  email!: string;

  @ApiProperty({
    description: 'Full name of the administrator',
    example: 'Dr. Sarah Johnson',
    maxLength: 200,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  fullName!: string;

  @ApiProperty({
    description: 'Enterprise role to assign to the administrator',
    enum: EnterpriseRole,
    example: EnterpriseRole.ORG_ADMIN,
    enumName: 'EnterpriseRole',
  })
  @IsEnum(EnterpriseRole)
  role!: EnterpriseRole;
}
