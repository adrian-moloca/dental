import { IsString, IsUUID, IsNotEmpty, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class DeviceLoginDto {
  @ApiProperty({
    description: 'Device ID (UUID v4)',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsUUID('4')
  @IsNotEmpty()
  deviceId!: string;

  @ApiProperty({
    description: 'Device access token from offline-sync-service',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  @IsString()
  @IsNotEmpty()
  deviceAccessToken!: string;

  @ApiProperty({
    description: 'Organization ID',
    example: '550e8400-e29b-41d4-a716-446655440001',
  })
  @IsUUID('4')
  @IsNotEmpty()
  organizationId!: string;

  @ApiProperty({
    description: 'Tenant ID',
    example: '550e8400-e29b-41d4-a716-446655440002',
  })
  @IsUUID('4')
  @IsNotEmpty()
  tenantId!: string;

  @ApiProperty({
    description: 'Optional clinic ID',
    example: '550e8400-e29b-41d4-a716-446655440003',
    required: false,
  })
  @IsUUID('4')
  @IsOptional()
  clinicId?: string;
}
