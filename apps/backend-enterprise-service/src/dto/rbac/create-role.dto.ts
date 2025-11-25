import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsArray,
  IsOptional,
  MaxLength,
  ArrayMinSize,
} from 'class-validator';

/**
 * DTO for creating a custom enterprise role
 */
export class CreateRoleDto {
  @ApiProperty({
    description: 'Unique role code (uppercase, underscore-separated)',
    example: 'REGIONAL_MANAGER',
    maxLength: 100,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  code!: string;

  @ApiProperty({
    description: 'Human-readable role name',
    example: 'Regional Manager',
    maxLength: 200,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  name!: string;

  @ApiProperty({
    description: 'Detailed description of the role and its responsibilities',
    example: 'Manages multiple clinics within a geographic region',
    required: false,
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    description: 'Array of permission codes granted to this role',
    example: ['VIEW_ALL_CLINICS', 'MANAGE_CLINIC_STAFF', 'VIEW_REPORTS'],
    type: [String],
    minItems: 1,
  })
  @IsArray()
  @ArrayMinSize(1)
  permissions!: string[];

  @ApiProperty({
    description: 'Role level: ORGANIZATION or CLINIC',
    example: 'ORGANIZATION',
    enum: ['ORGANIZATION', 'CLINIC'],
  })
  @IsString()
  @IsNotEmpty()
  level!: 'ORGANIZATION' | 'CLINIC';
}
