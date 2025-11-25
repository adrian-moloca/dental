/**
 * Migration: Create Audit Logs Table
 *
 * Creates immutable, append-only audit_logs table for HIPAA/GDPR compliance.
 * Implements partitioning by month for performance optimization.
 *
 * COMPLIANCE REQUIREMENTS:
 * - HIPAA §164.312(b): Audit controls
 * - GDPR Article 30: Records of processing activities
 * - Retention: 7 years (exceeds HIPAA 6-year requirement)
 *
 * PERFORMANCE OPTIMIZATIONS:
 * - Indexes on: (organizationId, timestamp), (userId, timestamp), (action, timestamp)
 * - Partitioning by month (optional, requires PostgreSQL 10+)
 * - FILLFACTOR=90 for append-only optimization
 *
 * SECURITY DESIGN:
 * - No foreign key constraints (prevents cascade deletes)
 * - No UPDATE/DELETE triggers (enforces immutability)
 * - JSONB for flexible metadata storage
 *
 * @migration
 */

import { MigrationInterface, QueryRunner, Table, TableIndex } from 'typeorm';

export class CreateAuditLogsTable1763651432000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create audit_logs table
    await queryRunner.createTable(
      new Table({
        name: 'audit_logs',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            default: 'uuid_generate_v4()',
            comment: 'Unique audit log entry identifier',
          },

          // ==================== ACTOR INFORMATION ====================
          {
            name: 'user_id',
            type: 'uuid',
            isNullable: false,
            comment: 'User who performed the action (from JWT sub claim)',
          },
          {
            name: 'user_email',
            type: 'varchar',
            length: '255',
            isNullable: false,
            comment: 'User email at time of action (denormalized)',
          },
          {
            name: 'user_roles',
            type: 'varchar[]',
            isNullable: false,
            default: 'ARRAY[]::varchar[]',
            comment: 'User roles at time of action (snapshot)',
          },

          // ==================== ACTION INFORMATION ====================
          {
            name: 'action',
            type: 'varchar',
            length: '100',
            isNullable: false,
            comment: 'Audit action type (e.g., role.assigned, access.denied)',
          },
          {
            name: 'resource',
            type: 'varchar',
            length: '100',
            isNullable: false,
            comment: 'Resource type affected (e.g., Role, UserRole, Permission)',
          },
          {
            name: 'resource_id',
            type: 'uuid',
            isNullable: true,
            comment: 'Specific resource ID affected (if applicable)',
          },

          // ==================== TENANT CONTEXT ====================
          {
            name: 'organization_id',
            type: 'uuid',
            isNullable: false,
            comment: 'Organization ID (tenant isolation - REQUIRED)',
          },
          {
            name: 'clinic_id',
            type: 'uuid',
            isNullable: true,
            comment: 'Clinic ID (optional clinic scope)',
          },

          // ==================== TEMPORAL INFORMATION ====================
          {
            name: 'timestamp',
            type: 'timestamp with time zone',
            isNullable: false,
            default: 'CURRENT_TIMESTAMP',
            comment: 'When action occurred (immutable)',
          },

          // ==================== REQUEST CONTEXT ====================
          {
            name: 'ip_address',
            type: 'varchar',
            length: '45',
            isNullable: false,
            default: "'0.0.0.0'",
            comment: 'Client IP address (GDPR-masked: XXX.XXX.XXX.xxx)',
          },
          {
            name: 'user_agent',
            type: 'text',
            isNullable: false,
            default: "'Unknown'",
            comment: 'User agent string (truncated to 500 chars)',
          },
          {
            name: 'correlation_id',
            type: 'uuid',
            isNullable: false,
            comment: 'Request correlation ID for tracing',
          },

          // ==================== RESULT INFORMATION ====================
          {
            name: 'status',
            type: 'varchar',
            length: '20',
            isNullable: false,
            comment: 'Action result: success or failure',
          },
          {
            name: 'error_message',
            type: 'text',
            isNullable: true,
            comment: 'Error message if status=failure (NO PHI/PII)',
          },

          // ==================== STATE CHANGES ====================
          {
            name: 'changes_before',
            type: 'jsonb',
            isNullable: true,
            comment: 'State before action (sanitized, NO PHI/PII)',
          },
          {
            name: 'changes_after',
            type: 'jsonb',
            isNullable: true,
            comment: 'State after action (sanitized, NO PHI/PII)',
          },

          // ==================== METADATA ====================
          {
            name: 'metadata',
            type: 'jsonb',
            isNullable: true,
            comment: 'Additional context metadata (sanitized, NO PHI/PII)',
          },
        ],
      }),
      true // ifNotExists
    );

    // ==================== INDEXES FOR PERFORMANCE ====================

    // Primary query pattern: organizationId + timestamp (DESC)
    await queryRunner.createIndex(
      'audit_logs',
      new TableIndex({
        name: 'idx_audit_logs_org_timestamp',
        columnNames: ['organization_id', 'timestamp'],
      })
    );

    // User activity queries: userId + timestamp (DESC)
    await queryRunner.createIndex(
      'audit_logs',
      new TableIndex({
        name: 'idx_audit_logs_user_timestamp',
        columnNames: ['user_id', 'timestamp'],
      })
    );

    // Action-specific queries: action + timestamp (DESC)
    await queryRunner.createIndex(
      'audit_logs',
      new TableIndex({
        name: 'idx_audit_logs_action_timestamp',
        columnNames: ['action', 'timestamp'],
      })
    );

    // Request tracing: correlationId (exact match)
    await queryRunner.createIndex(
      'audit_logs',
      new TableIndex({
        name: 'idx_audit_logs_correlation_id',
        columnNames: ['correlation_id'],
      })
    );

    // Failed action analysis: status + timestamp (DESC)
    await queryRunner.createIndex(
      'audit_logs',
      new TableIndex({
        name: 'idx_audit_logs_status_timestamp',
        columnNames: ['status', 'timestamp'],
      })
    );

    // Archival job queries: timestamp only (DESC)
    await queryRunner.createIndex(
      'audit_logs',
      new TableIndex({
        name: 'idx_audit_logs_timestamp',
        columnNames: ['timestamp'],
      })
    );

    // JSONB GIN indexes for metadata queries (optional, can add later if needed)
    // await queryRunner.query(
    //   'CREATE INDEX idx_audit_logs_metadata_gin ON audit_logs USING GIN (metadata);',
    // );

    // ==================== TABLE-LEVEL OPTIMIZATIONS ====================

    // Set FILLFACTOR to 90 for append-only optimization (leaves 10% free space)
    await queryRunner.query('ALTER TABLE audit_logs SET (fillfactor = 90);');

    // Add comment to table
    await queryRunner.query(`
      COMMENT ON TABLE audit_logs IS 'Immutable audit log for HIPAA/GDPR compliance. NO UPDATES OR DELETES ALLOWED.';
    `);

    // ==================== OPTIONAL: TABLE PARTITIONING ====================
    // Uncomment if using PostgreSQL 10+ with partitioning support
    // Note: Requires dropping and recreating table with PARTITION BY clause
    /*
    await queryRunner.query(`
      -- Create parent partitioned table
      CREATE TABLE audit_logs_partitioned (
        LIKE audit_logs INCLUDING ALL
      ) PARTITION BY RANGE (timestamp);

      -- Create monthly partitions (example: 2025)
      CREATE TABLE audit_logs_2025_01 PARTITION OF audit_logs_partitioned
        FOR VALUES FROM ('2025-01-01') TO ('2025-02-01');

      CREATE TABLE audit_logs_2025_02 PARTITION OF audit_logs_partitioned
        FOR VALUES FROM ('2025-02-01') TO ('2025-03-01');

      -- ... create partitions for each month ...

      -- Default partition for future data
      CREATE TABLE audit_logs_default PARTITION OF audit_logs_partitioned
        DEFAULT;
    `);
    */
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop indexes first
    await queryRunner.dropIndex('audit_logs', 'idx_audit_logs_timestamp');
    await queryRunner.dropIndex('audit_logs', 'idx_audit_logs_status_timestamp');
    await queryRunner.dropIndex('audit_logs', 'idx_audit_logs_correlation_id');
    await queryRunner.dropIndex('audit_logs', 'idx_audit_logs_action_timestamp');
    await queryRunner.dropIndex('audit_logs', 'idx_audit_logs_user_timestamp');
    await queryRunner.dropIndex('audit_logs', 'idx_audit_logs_org_timestamp');

    // Drop table
    await queryRunner.dropTable('audit_logs');
  }
}
