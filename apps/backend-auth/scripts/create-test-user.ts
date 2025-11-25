/**
 * Create Test User Script
 *
 * Creates a test user in the database with a known password
 */

import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';

async function createTestUser() {
  // Create database connection
  const dataSource = new DataSource({
    type: 'postgres',
    host: 'localhost',
    port: 5433,
    username: 'dental_user',
    password: 'dental_password',
    database: 'dental_db',
  });

  try {
    await dataSource.initialize();
    console.log('Connected to database');

    // Test user credentials
    const email = 'demo@dentalos.com';
    const password = 'Demo123!@#'; // Plain text password
    const firstName = 'Demo';
    const lastName = 'User';

    // Generate IDs
    const userId = crypto.randomUUID();
    const organizationId = crypto.randomUUID();

    // Hash password (bcrypt with 10 rounds)
    const passwordHash = await bcrypt.hash(password, 10);

    // Check if user already exists
    const existingUser = await dataSource.query(
      'SELECT id FROM users WHERE email = $1',
      [email.toLowerCase().trim()]
    );

    if (existingUser.length > 0) {
      console.log('\n⚠️  User already exists!');
      console.log('Deleting existing user and creating fresh one...\n');
      await dataSource.query('DELETE FROM users WHERE email = $1', [
        email.toLowerCase().trim(),
      ]);
    }

    // Insert test user
    await dataSource.query(
      `
      INSERT INTO users (
        id,
        email,
        "passwordHash",
        "firstName",
        "lastName",
        "organizationId",
        roles,
        permissions,
        status,
        "emailVerified",
        "createdAt",
        "updatedAt"
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW(), NOW())
    `,
      [
        userId,
        email.toLowerCase().trim(),
        passwordHash,
        firstName,
        lastName,
        organizationId,
        ['ADMIN', 'DOCTOR'], // roles
        ['*'], // permissions (full access)
        'ACTIVE',
        true, // emailVerified
      ]
    );

    console.log('✅ Test user created successfully!\n');
    console.log('═══════════════════════════════════════════════════════');
    console.log('📧 LOGIN CREDENTIALS:');
    console.log('═══════════════════════════════════════════════════════');
    console.log(`Email:        ${email}`);
    console.log(`Password:     ${password}`);
    console.log('');
    console.log('User Details:');
    console.log(`- User ID:         ${userId}`);
    console.log(`- Organization ID: ${organizationId}`);
    console.log(`- Name:            ${firstName} ${lastName}`);
    console.log(`- Status:          ACTIVE`);
    console.log(`- Email Verified:  Yes`);
    console.log(`- Roles:           ADMIN, DOCTOR`);
    console.log(`- Permissions:     Full Access (*)`);
    console.log('═══════════════════════════════════════════════════════');
    console.log('\n🌐 Login URL: http://localhost:5173/login\n');
  } catch (error: any) {
    console.error('❌ Error creating test user:', error.message);
    if (error.code === 'ECONNREFUSED') {
      console.error('\n⚠️  Cannot connect to PostgreSQL.');
      console.error('Make sure the database is running: docker-compose up -d');
    }
    process.exit(1);
  } finally {
    await dataSource.destroy();
  }
}

createTestUser();
