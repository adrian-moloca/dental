/**
 * MFA DTOs
 *
 * @module modules/auth/dto/mfa
 */

import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsIn, MinLength, MaxLength } from 'class-validator';

export class MfaChallengeDto {
  @ApiProperty({
    example: 'sms',
    description: 'MFA delivery method',
    enum: ['sms', 'email'],
  })
  @IsString()
  @IsIn(['sms', 'email'])
  method!: 'sms' | 'email';
}

export class MfaVerifyDto {
  @ApiProperty({
    example: '123456',
    description: 'MFA verification code',
  })
  @IsString()
  @MinLength(6)
  @MaxLength(6)
  code!: string;

  @ApiProperty({
    example: 'session-abc-123',
    description: 'MFA session ID',
  })
  @IsString()
  sessionId!: string;
}
