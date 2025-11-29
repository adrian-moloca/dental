/**
 * User Response DTO
 *
 * Response DTO for user data. Excludes sensitive fields like password hash.
 *
 * @module modules/users/dto
 */

import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { User, UserStatus } from '../entities/user.entity';

/**
 * Response DTO for a single user
 *
 * Security: Never includes passwordHash or security-sensitive fields
 */
export class UserResponseDto {
  @ApiProperty({ description: 'User ID' })
  id!: string;

  @ApiProperty({ description: 'Organization ID' })
  organizationId!: string;

  @ApiPropertyOptional({ description: 'Clinic ID (null for org-wide users)' })
  clinicId?: string | null;

  @ApiProperty({ description: 'User email address' })
  email!: string;

  @ApiProperty({ description: 'User first name' })
  firstName!: string;

  @ApiProperty({ description: 'User last name' })
  lastName!: string;

  @ApiProperty({ description: 'User roles', type: [String] })
  roles!: string[];

  @ApiProperty({ description: 'User permissions', type: [String] })
  permissions!: string[];

  @ApiProperty({ enum: UserStatus, description: 'User status' })
  status!: UserStatus;

  @ApiProperty({ description: 'Email verification status' })
  emailVerified!: boolean;

  @ApiPropertyOptional({ description: 'Last login timestamp' })
  lastLoginAt?: Date | null;

  @ApiProperty({ description: 'Account creation timestamp' })
  createdAt!: Date;

  @ApiProperty({ description: 'Last update timestamp' })
  updatedAt!: Date;

  /**
   * Create DTO from User entity
   *
   * Excludes sensitive fields like passwordHash, failedLoginAttempts, etc.
   */
  static fromEntity(user: User): UserResponseDto {
    const dto = new UserResponseDto();
    dto.id = user.id;
    dto.organizationId = user.organizationId;
    dto.clinicId = user.clinicId ?? null;
    dto.email = user.email;
    dto.firstName = user.firstName;
    dto.lastName = user.lastName;
    dto.roles = user.roles;
    dto.permissions = user.permissions;
    dto.status = user.status;
    dto.emailVerified = user.emailVerified;
    dto.lastLoginAt = user.lastLoginAt ?? null;
    dto.createdAt = user.createdAt;
    dto.updatedAt = user.updatedAt;
    return dto;
  }

  /**
   * Create DTOs from array of User entities
   */
  static fromEntities(users: User[]): UserResponseDto[] {
    return users.map((user) => UserResponseDto.fromEntity(user));
  }
}

/**
 * Response DTO for paginated user list
 */
export class PaginatedUsersResponseDto {
  @ApiProperty({ type: [UserResponseDto], description: 'List of users' })
  data!: UserResponseDto[];

  @ApiProperty({ description: 'Total number of users matching the query' })
  total!: number;

  @ApiProperty({ description: 'Current page number' })
  page!: number;

  @ApiProperty({ description: 'Items per page' })
  limit!: number;

  @ApiProperty({ description: 'Total number of pages' })
  totalPages!: number;

  /**
   * Create paginated response
   */
  static create(
    users: User[],
    total: number,
    page: number,
    limit: number
  ): PaginatedUsersResponseDto {
    const dto = new PaginatedUsersResponseDto();
    dto.data = UserResponseDto.fromEntities(users);
    dto.total = total;
    dto.page = page;
    dto.limit = limit;
    dto.totalPages = Math.ceil(total / limit);
    return dto;
  }
}
