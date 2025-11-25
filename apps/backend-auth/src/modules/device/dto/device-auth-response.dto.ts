import { ApiProperty } from '@nestjs/swagger';

export class DeviceAuthResponseDto {
  @ApiProperty({
    description: 'JWT access token for API requests',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  accessToken!: string;

  @ApiProperty({
    description: 'JWT refresh token for obtaining new access tokens',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  refreshToken!: string;

  @ApiProperty({
    description: 'Access token expiration time in seconds',
    example: 3600,
  })
  expiresIn!: number;

  @ApiProperty({
    description: 'Token type',
    example: 'Bearer',
  })
  tokenType!: string;

  @ApiProperty({
    description: 'Device ID',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  deviceId!: string;

  @ApiProperty({
    description: 'User ID associated with device',
    example: '550e8400-e29b-41d4-a716-446655440001',
  })
  userId!: string;
}
