/**
 * Users Controller
 *
 * REST API endpoints for user management operations.
 * All endpoints require JWT authentication and appropriate permissions.
 *
 * Security requirements:
 * - ALL endpoints require valid JWT token (@ApiBearerAuth)
 * - Permission-based authorization via @RequirePermission decorator
 * - Multi-tenant context extracted from JWT (organizationId)
 * - Input validation via class-validator DTOs
 *
 * @module modules/users/controllers
 */

import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
  ParseUUIDPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import type { OrganizationId } from '@dentalos/shared-types';

// Services
import { UsersService } from '../services/users.service';

// DTOs
import { ListUsersQueryDto } from '../dto/list-users-query.dto';
import { CreateUserDto } from '../dto/create-user.dto';
import { UpdateUserDto } from '../dto/update-user.dto';
import { UserResponseDto, PaginatedUsersResponseDto } from '../dto/user-response.dto';

// Decorators
import { RequirePermission } from '../../rbac/decorators/require-permission.decorator';
import { CurrentUser, UserContext } from '../../rbac/decorators/current-user.decorator';

/**
 * Users Controller
 *
 * Provides REST API endpoints for user management.
 * All routes require authentication and appropriate permissions.
 */
@Controller('users')
@ApiTags('Users')
@ApiBearerAuth()
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  /**
   * List users with filtering and pagination
   *
   * @param user - Authenticated user context
   * @param query - Query parameters for filtering/pagination
   * @returns Paginated list of users
   */
  @Get()
  @RequirePermission('admin.user.read')
  @Throttle({ default: { limit: 200, ttl: 60000 } })
  @ApiOperation({
    summary: 'List users',
    description: 'List all users in the organization with optional filtering and pagination.',
  })
  @ApiResponse({
    status: 200,
    description: 'Users retrieved successfully',
    type: PaginatedUsersResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Authentication required' })
  @ApiResponse({ status: 403, description: 'Insufficient permissions' })
  async listUsers(
    @CurrentUser() user: UserContext,
    @Query() query: ListUsersQueryDto
  ): Promise<PaginatedUsersResponseDto> {
    const result = await this.usersService.listUsers(user.organizationId as OrganizationId, query);

    return PaginatedUsersResponseDto.create(result.data, result.total, result.page, result.limit);
  }

  /**
   * Get user by ID
   *
   * @param id - User UUID
   * @param user - Authenticated user context
   * @returns User details
   */
  @Get(':id')
  @RequirePermission('admin.user.read')
  @Throttle({ default: { limit: 200, ttl: 60000 } })
  @ApiOperation({
    summary: 'Get user by ID',
    description: 'Retrieve a specific user by their ID.',
  })
  @ApiResponse({
    status: 200,
    description: 'User retrieved successfully',
    type: UserResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Authentication required' })
  @ApiResponse({ status: 403, description: 'Insufficient permissions' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async getUserById(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: UserContext
  ): Promise<UserResponseDto> {
    const foundUser = await this.usersService.getUserById(
      id,
      user.organizationId as OrganizationId
    );
    return UserResponseDto.fromEntity(foundUser);
  }

  /**
   * Create a new user
   *
   * @param dto - User creation data
   * @param user - Authenticated user context
   * @returns Created user
   */
  @Post()
  @RequirePermission('admin.user.create')
  @Throttle({ default: { limit: 50, ttl: 60000 } })
  @ApiOperation({
    summary: 'Create user',
    description: 'Create a new user in the organization.',
  })
  @ApiResponse({
    status: 201,
    description: 'User created successfully',
    type: UserResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiResponse({ status: 401, description: 'Authentication required' })
  @ApiResponse({ status: 403, description: 'Insufficient permissions' })
  @ApiResponse({ status: 409, description: 'Email already exists in organization' })
  async createUser(
    @Body() dto: CreateUserDto,
    @CurrentUser() user: UserContext
  ): Promise<UserResponseDto> {
    const createdUser = await this.usersService.createUser(
      user.organizationId as OrganizationId,
      dto
    );
    return UserResponseDto.fromEntity(createdUser);
  }

  /**
   * Update user
   *
   * @param id - User UUID
   * @param dto - Update data
   * @param user - Authenticated user context
   * @returns Updated user
   */
  @Patch(':id')
  @RequirePermission('admin.user.update')
  @Throttle({ default: { limit: 50, ttl: 60000 } })
  @ApiOperation({
    summary: 'Update user',
    description: 'Update an existing user. Only provided fields will be updated.',
  })
  @ApiResponse({
    status: 200,
    description: 'User updated successfully',
    type: UserResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiResponse({ status: 401, description: 'Authentication required' })
  @ApiResponse({ status: 403, description: 'Insufficient permissions' })
  @ApiResponse({ status: 404, description: 'User not found' })
  @ApiResponse({ status: 409, description: 'Email already exists in organization' })
  async updateUser(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateUserDto,
    @CurrentUser() user: UserContext
  ): Promise<UserResponseDto> {
    const updatedUser = await this.usersService.updateUser(
      id,
      user.organizationId as OrganizationId,
      dto
    );
    return UserResponseDto.fromEntity(updatedUser);
  }

  /**
   * Activate user
   *
   * @param id - User UUID
   * @param user - Authenticated user context
   */
  @Post(':id/activate')
  @RequirePermission('admin.user.update')
  @HttpCode(HttpStatus.NO_CONTENT)
  @Throttle({ default: { limit: 50, ttl: 60000 } })
  @ApiOperation({
    summary: 'Activate user',
    description: 'Activate a user account (set status to ACTIVE).',
  })
  @ApiResponse({ status: 204, description: 'User activated successfully' })
  @ApiResponse({ status: 401, description: 'Authentication required' })
  @ApiResponse({ status: 403, description: 'Insufficient permissions' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async activateUser(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: UserContext
  ): Promise<void> {
    await this.usersService.activateUser(id, user.organizationId as OrganizationId);
  }

  /**
   * Deactivate user
   *
   * @param id - User UUID
   * @param user - Authenticated user context
   */
  @Post(':id/deactivate')
  @RequirePermission('admin.user.update')
  @HttpCode(HttpStatus.NO_CONTENT)
  @Throttle({ default: { limit: 50, ttl: 60000 } })
  @ApiOperation({
    summary: 'Deactivate user',
    description: 'Deactivate a user account (soft delete by setting status to INACTIVE).',
  })
  @ApiResponse({ status: 204, description: 'User deactivated successfully' })
  @ApiResponse({ status: 401, description: 'Authentication required' })
  @ApiResponse({ status: 403, description: 'Insufficient permissions' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async deactivateUser(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: UserContext
  ): Promise<void> {
    await this.usersService.deactivateUser(id, user.organizationId as OrganizationId);
  }

  /**
   * Delete user (deactivate)
   *
   * Uses soft delete pattern - sets status to INACTIVE instead of actual deletion.
   *
   * @param id - User UUID
   * @param user - Authenticated user context
   */
  @Delete(':id')
  @RequirePermission('admin.user.delete')
  @HttpCode(HttpStatus.NO_CONTENT)
  @Throttle({ default: { limit: 50, ttl: 60000 } })
  @ApiOperation({
    summary: 'Delete user',
    description: 'Delete a user (soft delete - sets status to INACTIVE).',
  })
  @ApiResponse({ status: 204, description: 'User deleted successfully' })
  @ApiResponse({ status: 401, description: 'Authentication required' })
  @ApiResponse({ status: 403, description: 'Insufficient permissions' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async deleteUser(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: UserContext
  ): Promise<void> {
    await this.usersService.deactivateUser(id, user.organizationId as OrganizationId);
  }

  /**
   * Get user statistics
   *
   * @param user - Authenticated user context
   * @returns User count by status
   */
  @Get('stats/overview')
  @RequirePermission('admin.user.read')
  @Throttle({ default: { limit: 200, ttl: 60000 } })
  @ApiOperation({
    summary: 'Get user statistics',
    description: 'Get user count by status for the organization.',
  })
  @ApiResponse({
    status: 200,
    description: 'Statistics retrieved successfully',
  })
  @ApiResponse({ status: 401, description: 'Authentication required' })
  @ApiResponse({ status: 403, description: 'Insufficient permissions' })
  async getUserStats(@CurrentUser() user: UserContext): Promise<{
    total: number;
    active: number;
    inactive: number;
    invited: number;
    blocked: number;
  }> {
    return this.usersService.getUserStats(user.organizationId as OrganizationId);
  }
}
