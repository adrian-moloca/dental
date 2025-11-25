/**
 * RBAC Module
 *
 * Provides role-based access control functionality for the authentication service.
 * Integrates with TypeORM for database persistence and Redis for caching.
 *
 * Features:
 * - Role management (CRUD operations)
 * - Permission management (catalog)
 * - User role assignments with expiration support
 * - Role-permission mappings
 * - Permission checking with Redis caching
 * - Role checking with multi-tenant isolation
 *
 * Dependencies:
 * - TypeORM for database entities
 * - Redis (via CacheModule) for permission caching
 * - User module (for user references)
 *
 * @module modules/rbac
 */

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CacheModule } from '@nestjs/cache-manager';

// Entities
import { Role } from './entities/role.entity';
import { Permission } from './entities/permission.entity';
import { UserRole } from './entities/user-role.entity';
import { RolePermission } from './entities/role-permission.entity';

// Repositories
import { RoleRepository } from './repositories/role.repository';
import { PermissionRepository } from './repositories/permission.repository';
import { UserRoleRepository } from './repositories/user-role.repository';
import { RolePermissionRepository } from './repositories/role-permission.repository';

// Services
import { PermissionCheckerService } from './services/permission-checker.service';
import { RoleCheckerService } from './services/role-checker.service';
import { RBACService } from './services/rbac.service';

// Controllers
import { RBACController } from './controllers/rbac.controller';

// Guards
import { PermissionGuard } from './guards/permission.guard';

/**
 * RBAC Module
 *
 * Exports:
 * - RBACService: Main service for RBAC operations
 * - PermissionCheckerService: Permission checking with caching
 * - RoleCheckerService: Role checking
 * - PermissionGuard: Authorization guard for routes
 * - All repositories for direct access if needed
 */
@Module({
  imports: [
    // TypeORM entities
    TypeOrmModule.forFeature([Role, Permission, UserRole, RolePermission]),

    // Cache module for permission caching (imported from app module)
    CacheModule.register({
      ttl: 300, // 5 minutes
      max: 1000, // Maximum number of items in cache
    }),
  ],
  controllers: [
    // REST API controllers
    RBACController,
  ],
  providers: [
    // Repositories
    RoleRepository,
    PermissionRepository,
    UserRoleRepository,
    RolePermissionRepository,

    // Services
    PermissionCheckerService,
    RoleCheckerService,
    RBACService,

    // Guards (provided at module level for DI)
    PermissionGuard,
  ],
  exports: [
    // Export services for use in other modules
    RBACService,
    PermissionCheckerService,
    RoleCheckerService,

    // Export guard for use in other modules
    PermissionGuard,

    // Export repositories for advanced use cases
    RoleRepository,
    PermissionRepository,
    UserRoleRepository,
    RolePermissionRepository,
  ],
})
export class RBACModule {}
