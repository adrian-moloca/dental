/**
 * User Preferences Module
 *
 * Manages user-specific preferences such as dashboard layout and theme settings.
 * Provides REST API for retrieving and updating preferences.
 *
 * Components:
 * - UserPreference entity: TypeORM entity with tenant scoping
 * - UserPreferenceRepository: Data access layer with strict tenant isolation
 * - UserPreferencesService: Business logic for preference management
 * - UserPreferencesController: REST API endpoints
 *
 * Features:
 * - Auto-create default preferences on first access
 * - Upsert pattern for seamless updates
 * - Multi-tenant isolation
 * - JWT-based user identification
 *
 * @module modules/user-preferences
 */

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserPreference } from './entities/user-preference.entity';
import { UserPreferenceRepository } from './repositories/user-preference.repository';
import { UserPreferencesService } from './services/user-preferences.service';
import { UserPreferencesController } from './controllers/user-preferences.controller';
import { UsersModule } from '../users/users.module';

/**
 * User preferences module
 *
 * Provides UserPreference entity, repository, and services.
 * All queries are tenant-scoped for multi-tenant isolation.
 */
@Module({
  imports: [
    // Register UserPreference entity with TypeORM
    TypeOrmModule.forFeature([UserPreference]),
    // Import UsersModule to access UserRepository
    UsersModule,
  ],
  controllers: [
    // User preferences REST API controller
    UserPreferencesController,
  ],
  providers: [
    // User preference repository for data access
    UserPreferenceRepository,
    // User preferences service for business logic
    UserPreferencesService,
  ],
  exports: [
    // Export repository for use in other modules
    UserPreferenceRepository,
    // Export service for use in other modules
    UserPreferencesService,
  ],
})
export class UserPreferencesModule {}
