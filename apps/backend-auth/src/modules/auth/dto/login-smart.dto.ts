/**
 * Login Smart DTO
 *
 * Data transfer object for smart login endpoint.
 * Does NOT require organizationId - automatically resolved from email.
 *
 * Flow:
 * 1. User provides email + password
 * 2. Backend finds all organizations user belongs to
 * 3. If 1 org: Auto-login with JWT
 * 4. If multiple orgs: Return org list for user selection
 * 5. If 0 orgs: Return 401 Unauthorized
 *
 * @module modules/auth/dto
 */

import { IsEmail, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

/**
 * DTO for smart login (no organizationId required)
 */
export class LoginSmartDto {
  @ApiProperty({
    example: 'user@dentalclinic.com',
    description: 'User email address',
  })
  @IsEmail({}, { message: 'Invalid email format' })
  email!: string;

  @ApiProperty({
    example: 'SecureP@ssw0rd123',
    description: 'User password',
  })
  @IsString()
  @MinLength(1, { message: 'Password is required' })
  password!: string;
}
