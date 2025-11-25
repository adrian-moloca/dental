/**
 * Users Module
 *
 * Manages user accounts, authentication, and profile information.
 * Provides User entity and repository with multi-tenant isolation.
 *
 * Components:
 * - User entity: TypeORM entity with tenant scoping
 * - UserRepository: Data access layer with strict tenant isolation
 * - UserCabinet entity: Many-to-many relationship between users and cabinets
 * - UserCabinetRepository: Data access for user-cabinet assignments
 * - UserCabinetService: Business logic for cabinet assignment management
 * - PasswordService: Argon2id-based password hashing
 *
 * TODO (AUTH-003): Implement additional features:
 * - Profile management
 * - Email verification
 * - Multi-factor authentication (MFA)
 *
 * @module modules/users
 */

import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { UserCabinet } from './entities/user-cabinet.entity';
import { UserRepository } from './repositories/user.repository';
import { UserCabinetRepository } from './repositories/user-cabinet.repository';
import { PasswordService } from './services/password.service';
import { UserCabinetService } from './services/user-cabinet.service';
import { CabinetAssignmentService } from './services/cabinet-assignment.service';
import { AuthModule } from '../auth/auth.module';

/**
 * Users module
 *
 * Provides User entity, repository, and password service for user management.
 * Also provides UserCabinet entity and service for managing per-cabinet user assignments.
 * All queries are tenant-scoped for multi-tenant isolation.
 */
@Module({
  imports: [
    // Register User and UserCabinet entities with TypeORM
    TypeOrmModule.forFeature([User, UserCabinet]),
    // Import AuthModule to access SubscriptionClientService
    // Use forwardRef to handle circular dependency
    forwardRef(() => AuthModule),
  ],
  controllers: [],
  providers: [
    // User repository for data access
    UserRepository,
    // UserCabinet repository for user-cabinet relationships
    UserCabinetRepository,
    // Password service for secure hashing
    PasswordService,
    // UserCabinet service for business logic
    UserCabinetService,
    // Cabinet assignment service for automatic cabinet assignment
    CabinetAssignmentService,
  ],
  exports: [
    // Export repository for use in other modules
    UserRepository,
    // Export UserCabinet repository for use in other modules
    UserCabinetRepository,
    // Export password service for authentication
    PasswordService,
    // Export UserCabinet service for cabinet assignment management
    UserCabinetService,
    // Export Cabinet assignment service for use in auth module
    CabinetAssignmentService,
  ],
})
export class UsersModule {}
