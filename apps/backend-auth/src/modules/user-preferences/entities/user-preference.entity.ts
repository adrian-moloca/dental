/**
 * UserPreference Entity
 *
 * Stores user-specific preferences such as dashboard layout and theme settings.
 * Supports multi-tenant isolation with organizationId.
 *
 * Security requirements:
 * - All queries MUST filter by organizationId for tenant isolation
 * - Unique preference record per user per organization
 *
 * Edge cases handled:
 * - Dashboard layout stored as JSONB for flexibility
 * - Theme preferences optional for future extensibility
 * - Auto-timestamps for created/updated tracking
 *
 * @module modules/user-preferences/entities
 */

import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';
import type { OrganizationId } from '@dentalos/shared-types';

/**
 * Dashboard section configuration
 */
export interface DashboardSection {
  /** Unique section identifier */
  id: string;
  /** X-coordinate position */
  x: number;
  /** Y-coordinate position */
  y: number;
  /** Width in grid units */
  w: number;
  /** Height in grid units */
  h: number;
  /** Whether section is visible */
  visible: boolean;
}

/**
 * Theme preference configuration (for future use)
 */
export interface ThemePreferences {
  /** Theme mode: light, dark, auto */
  mode?: 'light' | 'dark' | 'auto';
  /** Primary color override */
  primaryColor?: string;
  /** Font size preference */
  fontSize?: 'small' | 'medium' | 'large';
  /** High contrast mode */
  highContrast?: boolean;
}

/**
 * UserPreference entity with multi-tenant isolation
 *
 * Database indexes:
 * - Primary key on id (UUID)
 * - Unique index on (userId, organizationId) - one preference record per user per organization
 * - Index on organizationId for tenant-scoped queries
 */
@Entity('user_preferences')
@Index(['userId', 'organizationId'], { unique: true })
@Index(['organizationId'])
export class UserPreference {
  /**
   * Unique preference record identifier (UUID v4)
   */
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  /**
   * User to whom these preferences belong
   * References users.id
   */
  @Column({ type: 'uuid', name: 'user_id' })
  userId!: string;

  /**
   * Organization to which this user belongs
   * CRITICAL: Always include in WHERE clauses for tenant isolation
   */
  @Column({ type: 'uuid', name: 'organization_id' })
  organizationId!: OrganizationId;

  /**
   * Dashboard layout configuration
   * Array of section configurations with position and visibility
   */
  @Column({ type: 'jsonb', name: 'dashboard_layout', default: '[]' })
  dashboardLayout!: DashboardSection[];

  /**
   * Theme preferences (optional, for future use)
   * Allows users to customize appearance
   */
  @Column({ type: 'jsonb', name: 'theme_preferences', nullable: true })
  themePreferences?: ThemePreferences | null;

  /**
   * Timestamp when preferences were created
   * Automatically set by TypeORM
   */
  @CreateDateColumn({ type: 'timestamp', name: 'created_at' })
  createdAt!: Date;

  /**
   * Timestamp when preferences were last updated
   * Automatically updated by TypeORM on save
   */
  @UpdateDateColumn({ type: 'timestamp', name: 'updated_at' })
  updatedAt!: Date;
}
