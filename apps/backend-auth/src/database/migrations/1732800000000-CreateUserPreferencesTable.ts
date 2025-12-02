import { MigrationInterface, QueryRunner, Table, TableIndex, TableForeignKey } from 'typeorm';

export class CreateUserPreferencesTable1732800000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'user_preferences',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            default: 'uuid_generate_v4()',
          },
          {
            name: 'user_id',
            type: 'uuid',
            isNullable: false,
          },
          {
            name: 'organization_id',
            type: 'uuid',
            isNullable: false,
          },
          {
            name: 'dashboard_layout',
            type: 'jsonb',
            default: "'[]'",
          },
          {
            name: 'theme_preferences',
            type: 'jsonb',
            isNullable: true,
          },
          {
            name: 'created_at',
            type: 'timestamp with time zone',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'updated_at',
            type: 'timestamp with time zone',
            default: 'CURRENT_TIMESTAMP',
          },
        ],
      }),
      true
    );

    // Create unique index on (user_id, organization_id)
    // Ensures one preference record per user per organization
    await queryRunner.createIndex(
      'user_preferences',
      new TableIndex({
        name: 'idx_user_preferences_user_org_unique',
        columnNames: ['user_id', 'organization_id'],
        isUnique: true,
      })
    );

    // Create index on organization_id for tenant-scoped queries
    await queryRunner.createIndex(
      'user_preferences',
      new TableIndex({
        name: 'idx_user_preferences_org',
        columnNames: ['organization_id'],
      })
    );

    // Foreign key to users table
    await queryRunner.createForeignKey(
      'user_preferences',
      new TableForeignKey({
        columnNames: ['user_id'],
        referencedTableName: 'users',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      })
    );

    // Foreign key to organizations table
    await queryRunner.createForeignKey(
      'user_preferences',
      new TableForeignKey({
        columnNames: ['organization_id'],
        referencedTableName: 'organizations',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('user_preferences');
  }
}
