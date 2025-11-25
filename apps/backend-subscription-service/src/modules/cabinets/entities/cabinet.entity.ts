/**
 * Cabinet Entity
 *
 * Represents a physical or logical dental cabinet/clinic location within an organization.
 * Each cabinet can have its own settings, operating hours, and default configurations.
 *
 * Security requirements:
 * - All queries MUST filter by organizationId for tenant isolation
 * - Only one default cabinet per organization allowed
 * - Unique code per organization (optional field)
 *
 * Edge cases handled:
 * - Multiple cabinets per organization
 * - Only one cabinet can be default per organization
 * - Optional owner assignment (dentist/clinic admin)
 * - Soft delete via status change (INACTIVE/ARCHIVED)
 * - Address and contact info are optional
 * - JSONB settings for flexible configuration (working hours, timezone, etc.)
 *
 * @module modules/cabinets/entities
 */

import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  Index,
} from 'typeorm';
import type { OrganizationId, UUID } from '@dentalos/shared-types';
import { EntityStatus } from '@dentalos/shared-types';

/**
 * Cabinet settings interface
 * Flexible JSONB structure for cabinet-specific configurations
 */
export interface CabinetSettings {
  /** Timezone for the cabinet (e.g., 'America/New_York') */
  timezone: string;
  /** Language code (e.g., 'en', 'es', 'ro') */
  language: string;
  /** Currency code (e.g., 'USD', 'EUR', 'RON') */
  currency: string;
  /** Date format preference (e.g., 'MM/DD/YYYY', 'DD/MM/YYYY') */
  dateFormat: string;
  /** Working hours for each day of the week */
  workingHours?: Record<
    string,
    {
      start: string;
      end: string;
      closed?: boolean;
    }
  >;
  /** Additional flexible settings */
  [key: string]: unknown;
}

/**
 * Cabinet entity with multi-tenant isolation
 *
 * Database indexes:
 * - Primary key on id (UUID)
 * - Index on organizationId for tenant-scoped queries
 * - Composite index on (organizationId, status) for filtering active cabinets
 * - Composite index on (organizationId, isDefault) for finding default cabinet
 * - Unique index on (organizationId, code) for unique code validation
 * - Index on ownerId for owner-scoped queries
 */
@Entity('cabinets')
@Index(['organizationId'])
@Index(['organizationId', 'status'])
@Index(['organizationId', 'isDefault'])
@Index(['organizationId', 'code'], { unique: true, where: 'code IS NOT NULL' })
@Index(['ownerId'])
export class Cabinet {
  /**
   * Unique cabinet identifier (UUID v4)
   */
  @PrimaryGeneratedColumn('uuid')
  id!: UUID;

  /**
   * Organization to which this cabinet belongs
   * CRITICAL: Always include in WHERE clauses for tenant isolation
   */
  @Column({ type: 'uuid', name: 'organization_id' })
  organizationId!: OrganizationId;

  /**
   * Cabinet name (e.g., 'Main Office', 'Downtown Branch')
   */
  @Column({ type: 'varchar', length: 255 })
  name!: string;

  /**
   * Unique code for the cabinet within organization
   * Optional identifier for integration purposes (e.g., 'CAB-001', 'DT-1')
   * Unique per organization (not globally unique)
   */
  @Column({ type: 'varchar', length: 100, nullable: true })
  code?: string;

  /**
   * Whether this is the default cabinet for the organization
   * Only one cabinet can be default per organization
   * Used for auto-selection in appointment booking and other workflows
   */
  @Column({ type: 'boolean', name: 'is_default', default: false })
  isDefault!: boolean;

  /**
   * Optional owner/manager of the cabinet
   * References a User ID (dentist, clinic admin, etc.)
   * NULL means cabinet has no specific owner
   */
  @Column({ type: 'uuid', name: 'owner_id', nullable: true })
  ownerId?: UUID;

  // ============================================================================
  // Address Information
  // ============================================================================

  /**
   * Street address (optional)
   */
  @Column({ type: 'varchar', length: 500, nullable: true })
  address?: string;

  /**
   * City (optional)
   */
  @Column({ type: 'varchar', length: 100, nullable: true })
  city?: string;

  /**
   * State/Province (optional)
   */
  @Column({ type: 'varchar', length: 50, nullable: true })
  state?: string;

  /**
   * Zip/Postal code (optional)
   */
  @Column({ type: 'varchar', length: 20, name: 'zip_code', nullable: true })
  zipCode?: string;

  /**
   * Country (optional)
   */
  @Column({ type: 'varchar', length: 100, nullable: true })
  country?: string;

  // ============================================================================
  // Contact Information
  // ============================================================================

  /**
   * Phone number (optional)
   * Should be in E.164 format when provided
   */
  @Column({ type: 'varchar', length: 50, nullable: true })
  phone?: string;

  /**
   * Email address (optional)
   */
  @Column({ type: 'varchar', length: 255, nullable: true })
  email?: string;

  /**
   * Website URL (optional)
   */
  @Column({ type: 'varchar', length: 500, nullable: true })
  website?: string;

  // ============================================================================
  // Status & Settings
  // ============================================================================

  /**
   * Cabinet status
   * - ACTIVE: Cabinet is operational
   * - INACTIVE: Cabinet is temporarily closed
   * - ARCHIVED: Cabinet is permanently closed (soft delete)
   * - PENDING: Cabinet is being set up
   */
  @Column({
    type: 'enum',
    enum: EntityStatus,
    default: EntityStatus.ACTIVE,
  })
  status!: EntityStatus;

  /**
   * Flexible JSONB settings for cabinet configuration
   * - timezone: Cabinet timezone
   * - language: Default language
   * - currency: Default currency
   * - dateFormat: Date format preference
   * - workingHours: Operating hours per day of week
   * - Additional custom settings as needed
   */
  @Column({ type: 'jsonb', nullable: true })
  settings?: CabinetSettings;

  // ============================================================================
  // Audit Timestamps
  // ============================================================================

  /**
   * Timestamp when cabinet was created
   * Automatically set by TypeORM
   */
  @CreateDateColumn({ type: 'timestamp', name: 'created_at' })
  createdAt!: Date;

  /**
   * Timestamp when cabinet was last updated
   * Automatically updated by TypeORM on save
   */
  @UpdateDateColumn({ type: 'timestamp', name: 'updated_at' })
  updatedAt!: Date;

  /**
   * Timestamp when cabinet was soft deleted
   * NULL if not deleted
   * Used for soft delete functionality
   */
  @DeleteDateColumn({ type: 'timestamp', name: 'deleted_at', nullable: true })
  deletedAt?: Date;

  /**
   * User ID who created this cabinet
   * NULL if created by system or unknown
   */
  @Column({ type: 'uuid', name: 'created_by', nullable: true })
  createdBy?: UUID;
}
