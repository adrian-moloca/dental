/**
 * User Seeder for Development
 *
 * Creates test users with proper password hashing for local development.
 * This seeder is idempotent - safe to run multiple times.
 *
 * Usage:
 *   npx ts-node -r tsconfig-paths/register src/database/seed-users.ts
 *
 * @module database/seed-users
 */

import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { Logger } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { hash } from '@node-rs/argon2';
import { AppModule } from '../app.module';
import { User, UserStatus } from '../modules/users/entities/user.entity';

/**
 * Test organization and clinic IDs (UUIDs)
 */
const TEST_ORG_ID = '00000000-0000-0000-0000-000000000001';
const TEST_CLINIC_ID = '00000000-0000-0000-0000-000000000011';

/**
 * Test users configuration
 */
interface TestUserConfig {
  id: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  roles: string[];
  permissions: string[];
  clinicId?: string;
}

const TEST_USERS: TestUserConfig[] = [
  {
    id: '00000000-0000-0000-0000-000000000101',
    email: 'admin@dentalos.local',
    password: 'Password123!',
    firstName: 'Admin',
    lastName: 'User',
    roles: ['SUPER_ADMIN', 'CLINIC_ADMIN'],
    permissions: ['*:*'],
  },
  {
    id: '00000000-0000-0000-0000-000000000102',
    email: 'dentist@dentalos.local',
    password: 'Password123!',
    firstName: 'Dr. Jane',
    lastName: 'Smith',
    roles: ['DENTIST'],
    permissions: [
      'patients:read',
      'patients:write',
      'appointments:read',
      'appointments:write',
      'clinical:read',
      'clinical:write',
    ],
    clinicId: TEST_CLINIC_ID,
  },
  {
    id: '00000000-0000-0000-0000-000000000103',
    email: 'receptionist@dentalos.local',
    password: 'Password123!',
    firstName: 'Sarah',
    lastName: 'Johnson',
    roles: ['RECEPTIONIST'],
    permissions: ['patients:read', 'patients:write', 'appointments:read', 'appointments:write'],
    clinicId: TEST_CLINIC_ID,
  },
  {
    id: '00000000-0000-0000-0000-000000000104',
    email: 'patient@dentalos.local',
    password: 'Password123!',
    firstName: 'John',
    lastName: 'Doe',
    roles: ['PATIENT'],
    permissions: ['appointments:read:own', 'clinical:read:own'],
  },
];

/**
 * Seed test users with proper password hashing
 * Note: Organization table does not exist - organizationId is just a UUID reference
 */
async function seedUsers(dataSource: DataSource): Promise<void> {
  const logger = new Logger('SeedUsers');
  const userRepository = dataSource.getRepository(User);

  logger.log('Creating test users...');

  for (const userConfig of TEST_USERS) {
    // Hash password using argon2
    const passwordHash = await hash(userConfig.password);

    // Create or update user
    const user = userRepository.create({
      id: userConfig.id,
      organizationId: TEST_ORG_ID as any,
      clinicId: userConfig.clinicId as any,
      email: userConfig.email,
      passwordHash,
      firstName: userConfig.firstName,
      lastName: userConfig.lastName,
      roles: userConfig.roles,
      permissions: userConfig.permissions,
      status: UserStatus.ACTIVE,
      emailVerified: true,
    });

    await userRepository.save(user);
    logger.log(`✓ User created/updated: ${userConfig.email} (${userConfig.roles.join(', ')})`);
  }
}

/**
 * Display seeding summary
 */
async function displaySummary(): Promise<void> {
  const logger = new Logger('SeedSummary');

  logger.log('');
  logger.log('========================================');
  logger.log('  Test Users Created');
  logger.log('========================================');
  logger.log('');

  TEST_USERS.forEach((user) => {
    logger.log(`${user.email}`);
    logger.log(`  Password: ${user.password}`);
    logger.log(`  Roles: ${user.roles.join(', ')}`);
    logger.log('');
  });

  logger.log('========================================');
  logger.log('');
}

/**
 * Main seeder function
 */
async function main(): Promise<void> {
  const logger = new Logger('UserSeeder');

  logger.log('');
  logger.log('========================================');
  logger.log('  DentalOS User Seeder');
  logger.log('========================================');
  logger.log('');

  // Bootstrap NestJS application
  const app = await NestFactory.createApplicationContext(AppModule, {
    logger: ['error', 'warn', 'log'],
  });

  try {
    // Get DataSource
    const dataSource = app.get(DataSource);

    // Note: Organization table is owned by subscription service
    // Users just reference organization_id as a foreign key
    // The subscription service should seed organizations first

    // Seed users
    await seedUsers(dataSource);

    // Display summary
    await displaySummary();

    logger.log('✅ User seeding completed successfully!');
    logger.log('');

    await app.close();
    process.exit(0);
  } catch (error) {
    logger.error('User seeding failed:');
    logger.error(error instanceof Error ? error.message : String(error));

    if (error instanceof Error && error.stack) {
      logger.error(error.stack);
    }

    await app.close();
    process.exit(1);
  }
}

// Run seeder
main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
