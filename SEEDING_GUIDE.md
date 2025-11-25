# DentalOS Data Seeding Guide

This guide explains how to seed test data for local development in the DentalOS platform.

## Quick Start

### Option 1: Launch with Seeding (Recommended)

Start Docker services and automatically seed test data:

```bash
./launch_docker.sh dev --seed
```

This will:
1. Start all services in dev mode
2. Wait for services to be healthy (~60 seconds)
3. Automatically seed all test data
4. Display test credentials

### Option 2: Launch with Fresh Database

Reset the database and seed fresh data:

```bash
./launch_docker.sh dev --reset-db --seed
```

### Option 3: Manual Seeding

If services are already running, seed data manually:

```bash
./seed-local-data.sh
```

---

## Test User Credentials

After seeding, the following test users are available:

| Role | Email | Password | Permissions |
|------|-------|----------|-------------|
| Admin | `admin@dentalos.local` | `Password123!` | Full system access |
| Dentist | `dentist@dentalos.local` | `Password123!` | Clinical + Patient + Appointments |
| Receptionist | `receptionist@dentalos.local` | `Password123!` | Patient + Appointments |
| Patient | `patient@dentalos.local` | `Password123!` | Own data only |

See [TEST_USERS.md](TEST_USERS.md) for detailed information about each user.

---

## What Gets Seeded?

### 1. Auth Service
- Test organization: "Test Dental Clinic"
- 4 test users with different roles
- Proper password hashing with bcrypt

### 2. Subscription Service
- System modules (Scheduling, Patients, Clinical, etc.)
- Default cabinets for the test organization

### 3. Patient Service
- 3 sample patients:
  - Emma Wilson (Adult, allergies)
  - Michael Brown (Adult, medications)
  - Sophia Davis (Minor with guardian)

### 4. Scheduling Service
- 3 sample appointments:
  - Tomorrow 9:00 AM - Checkup
  - Tomorrow 2:00 PM - Filling
  - Next Week 10:00 AM - Consultation

### 5. Clinical Service
- Sample clinical notes
- Sample odontogram with tooth chart

---

## Seed Script Options

The `seed-local-data.sh` script supports several options:

```bash
# Seed all services (default)
./seed-local-data.sh

# Seed auth service only (faster)
./seed-local-data.sh --auth-only

# Skip health checks (faster but risky)
./seed-local-data.sh --no-wait

# Show help
./seed-local-data.sh --help
```

---

## Idempotency

All seeders are idempotent - safe to run multiple times:

- **Auth Service**: Updates existing users if email already exists
- **Subscription Service**: Skips existing modules/cabinets
- **Patient Service**: Uses `insertMany` with `ordered: false` to skip duplicates
- **Scheduling Service**: Uses ObjectId-based insertion to avoid duplicates
- **Clinical Service**: Uses ObjectId-based insertion to avoid duplicates

You can re-run the seed script without resetting the database:

```bash
./seed-local-data.sh
```

---

## Architecture

### Seed Script Structure

```
seed-local-data.sh
├── Helper Functions (print_*, wait_for_service)
├── Auth Service Seeder (TypeScript + SQL fallback)
├── Subscription Service Seeder (Existing TS seeder)
├── Patient Service Seeder (MongoDB shell)
├── Scheduling Service Seeder (MongoDB shell)
├── Clinical Service Seeder (MongoDB shell)
└── Summary Report
```

### Auth Service Seeding

The auth service uses a two-tier approach:

1. **Primary**: TypeScript seeder (`apps/backend-auth/src/database/seed-users.ts`)
   - Uses bcrypt for proper password hashing
   - Integrates with TypeORM entities
   - Best practices and type safety

2. **Fallback**: Direct SQL insertion
   - Used if TypeScript seeder fails
   - Uses pre-computed bcrypt hashes
   - Reliable but less maintainable

---

## Troubleshooting

### Services Not Healthy

If services don't become healthy:

```bash
# Check service status
docker compose -f docker-compose.dev.yml ps

# View logs
docker compose -f docker-compose.dev.yml logs auth
docker compose -f docker-compose.dev.yml logs subscription

# Restart specific service
docker compose -f docker-compose.dev.yml restart auth
```

### Seeding Fails

If seeding fails:

1. **Check logs**: Look for error messages in script output
2. **Verify services**: Ensure all services are running and healthy
3. **Reset database**: Try with `--reset-db` flag
4. **Manual verification**: Connect to databases directly

```bash
# Connect to auth database (PostgreSQL)
docker compose -f docker-compose.dev.yml exec postgres psql -U dev -d dentalos_auth

# Connect to patient database (MongoDB)
docker compose -f docker-compose.dev.yml exec mongo mongosh patient
```

### Login Fails

If you cannot log in with test credentials:

1. **Verify user exists**:
   ```bash
   docker compose -f docker-compose.dev.yml exec postgres psql -U dev -d dentalos_auth -c "SELECT email, status FROM users;"
   ```

2. **Check password hash**:
   ```bash
   docker compose -f docker-compose.dev.yml exec postgres psql -U dev -d dentalos_auth -c "SELECT email, LENGTH(password_hash) FROM users;"
   ```

3. **Verify JWT secrets**: Check `.env.docker` has correct secrets

4. **Reset user password**: Use auth service API to reset password

### Data Not Appearing

If seeded data doesn't appear:

1. **Check tenant isolation**: Ensure queries include correct `organizationId`
2. **Verify database**: Connect directly and query tables
3. **Check service logs**: Look for errors in service logs
4. **Re-seed**: Run seed script again (it's idempotent)

---

## Development Workflow

### Typical Workflow

1. **Start fresh**:
   ```bash
   ./launch_docker.sh dev --reset-db --seed
   ```

2. **Develop and test**: Make changes to code

3. **Re-seed if needed**: Run seed script again for fresh data
   ```bash
   ./seed-local-data.sh
   ```

4. **Reset when needed**: Start from scratch
   ```bash
   ./launch_docker.sh down
   ./launch_docker.sh dev --reset-db --seed
   ```

### Adding New Test Data

To add more test data:

1. **Edit seed script**: Modify `seed-local-data.sh`
2. **Add service-specific seeder**: Create TypeScript seeder for complex logic
3. **Test idempotency**: Ensure seeder can run multiple times
4. **Update documentation**: Update this guide and TEST_USERS.md

---

## Production Considerations

### DO NOT Use in Production

These seeders and test credentials are for **local development only**:

- Weak passwords (for convenience)
- Predictable UUIDs
- Demo data that may contain PII
- No proper data validation
- No audit logging

### Production Data Migration

For production:

1. **Use proper migrations**: TypeORM migrations for schema changes
2. **Use data migration scripts**: Separate scripts for data changes
3. **Test in staging**: Never run seeders in production
4. **Use strong secrets**: Generate cryptographically secure secrets
5. **Follow data privacy**: Comply with HIPAA/GDPR requirements

---

## Advanced Usage

### Custom Organization ID

Seed data for a specific organization:

```bash
# Edit TEST_ORG_ID in seed-local-data.sh
TEST_ORG_ID="your-org-uuid"
./seed-local-data.sh
```

### Seed Specific Services

Modify the script to seed only specific services:

```bash
# Edit seed-local-data.sh flags
SEED_AUTH=true
SEED_SUBSCRIPTION=false  # Skip subscription
SEED_PATIENT=true
SEED_SCHEDULING=false     # Skip scheduling
SEED_CLINICAL=false       # Skip clinical
```

### Performance Optimization

For faster seeding:

1. **Skip health checks**: Use `--no-wait` (risky)
2. **Seed only auth**: Use `--auth-only`
3. **Reduce wait times**: Modify `MAX_RETRIES` in script
4. **Parallel seeding**: Seed services concurrently (advanced)

---

## Related Documentation

- [TEST_USERS.md](TEST_USERS.md) - Detailed test user information
- [QUICK_START.md](QUICK_START.md) - Getting started guide
- [DOCKER_COMMANDS.md](DOCKER_COMMANDS.md) - Docker reference
- [SETUP_SUMMARY.md](SETUP_SUMMARY.md) - Setup instructions

---

## Maintenance

### Updating Test Data

When adding new features, update test data:

1. Add new users/roles in `apps/backend-auth/src/database/seed-users.ts`
2. Add new patients in `seed-local-data.sh` (Patient Service section)
3. Add new appointments/clinical records as needed
4. Update TEST_USERS.md with new credentials
5. Test seeding end-to-end

### Keeping Seeders in Sync

When schema changes:

1. Update TypeORM entities
2. Update seed-users.ts to match new schema
3. Update SQL fallback if needed
4. Update MongoDB seed scripts
5. Run migrations before seeding
6. Test with `--reset-db` flag

---

**Last Updated:** 2025-11-24
**Maintained By:** DentalOS Development Team
