import { ApiProperty } from '@nestjs/swagger';

/**
 * Permission definition DTO
 */
export class PermissionDto {
  @ApiProperty({
    description: 'Permission code',
    example: 'VIEW_ALL_CLINICS',
  })
  code!: string;

  @ApiProperty({
    description: 'Permission name',
    example: 'View All Clinics',
  })
  name!: string;

  @ApiProperty({
    description: 'Permission description',
    example: 'Allows viewing all clinics in the organization',
  })
  description!: string;

  @ApiProperty({
    description: 'Permission category',
    example: 'CLINIC_MANAGEMENT',
  })
  category!: string;
}

/**
 * Role definition DTO
 */
export class RoleDto {
  @ApiProperty({
    description: 'Role code',
    example: 'ORG_ADMIN',
  })
  code!: string;

  @ApiProperty({
    description: 'Role name',
    example: 'Organization Administrator',
  })
  name!: string;

  @ApiProperty({
    description: 'Role description',
    example: 'Full administrative access to the organization',
  })
  description!: string;

  @ApiProperty({
    description: 'Role level',
    example: 'ORGANIZATION',
    enum: ['ORGANIZATION', 'CLINIC'],
  })
  level!: string;

  @ApiProperty({
    description: 'Permissions granted by this role',
    type: [String],
    example: ['VIEW_ALL_CLINICS', 'MANAGE_CLINICS', 'MANAGE_ORGANIZATION'],
  })
  permissions!: string[];
}

/**
 * Permissions response DTO
 */
export class PermissionsResponseDto {
  @ApiProperty({
    description: 'Available enterprise-level roles',
    type: [String],
    example: ['ORG_ADMIN', 'ORG_MANAGER', 'MULTI_CLINIC_MANAGER', 'AUDITOR', 'SYSTEM_OWNER'],
  })
  enterpriseRoles!: string[];

  @ApiProperty({
    description: 'Available clinic-level roles',
    type: [String],
    example: ['CLINIC_MANAGER', 'CLINIC_OWNER', 'CLINIC_FINANCE', 'CLINIC_STAFF_ADMIN'],
  })
  clinicRoles!: string[];

  @ApiProperty({
    description: 'All available permissions with details',
    type: [PermissionDto],
    required: false,
  })
  permissions?: PermissionDto[];
}

/**
 * Role creation response DTO
 */
export class CreateRoleResponseDto {
  @ApiProperty({
    description: 'Indicates successful role creation',
    example: true,
  })
  success!: boolean;

  @ApiProperty({
    description: 'Created role ID',
    example: 'role-550e8400-e29b-41d4-a716-446655440000',
  })
  roleId!: string;

  @ApiProperty({
    description: 'Created role details',
    type: () => RoleDto,
    required: false,
  })
  role?: RoleDto;
}
