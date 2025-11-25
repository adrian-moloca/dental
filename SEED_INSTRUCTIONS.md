# Test Data Seeding Instructions

## Overview

The DentalOS project includes comprehensive seeding scripts to populate your local development environment with test data. This allows you to start developing immediately without manually creating users, patients, appointments, etc.

## Quick Start

### Recommended: Launch with Automatic Seeding

```bash
./launch_docker.sh dev --seed
```

This single command will:
1. Start all Docker services in development mode
2. Wait for services to become healthy (~60-90 seconds)
3. Automatically seed all test data
4. Display test user credentials

### Alternative: Manual Seeding

If services are already running:

```bash
./seed-local-data.sh
```

## Test User Credentials

After seeding, log in with any of these accounts:

| Email | Password | Role |
|-------|----------|------|
| admin@dentalos.local | Password123! | Admin |
| dentist@dentalos.local | Password123! | Dentist |
| receptionist@dentalos.local | Password123! | Receptionist |
| patient@dentalos.local | Password123! | Patient |

## Files Created

### Main Scripts
- `seed-local-data.sh` - Master seeding script (executable)
- `apps/backend-auth/src/database/seed-users.ts` - TypeScript user seeder

### Documentation
- `TEST_USERS.md` - Detailed test user information
- `SEEDING_GUIDE.md` - Complete seeding documentation
- `SEED_SUMMARY.txt` - Quick reference summary

### Modified
- `launch_docker.sh` - Now supports `--seed` and `--wait` flags

## What Gets Seeded

1. **Auth Service**
   - Test organization: "Test Dental Clinic"
   - 4 test users (admin, dentist, receptionist, patient)
   - Proper bcrypt password hashing

2. **Subscription Service**
   - System modules (Scheduling, Patients, Clinical, etc.)
   - Default cabinets

3. **Patient Service**
   - 3 sample patients with demographics and medical history

4. **Scheduling Service**
   - 3 sample appointments (tomorrow and next week)

5. **Clinical Service**
   - Sample clinical notes
   - Sample odontogram

## Key Features

- **Idempotent**: Safe to run multiple times without duplicates
- **Health Checks**: Waits for services before seeding
- **Proper Security**: Uses bcrypt for password hashing
- **Error Handling**: Graceful fallbacks and meaningful errors
- **Color-Coded Output**: Easy to read progress indicators

## Common Use Cases

### Fresh Start with Clean Database

```bash
./launch_docker.sh dev --reset-db --seed
```

### Re-seed Data (Keep Existing Database)

```bash
./seed-local-data.sh
```

### Seed Only Auth Service (Fast)

```bash
./seed-local-data.sh --auth-only
```

### Skip Health Checks (Risky but Fast)

```bash
./seed-local-data.sh --no-wait
```

## Troubleshooting

### Services Don't Start

```bash
# Check service status
docker compose -f docker-compose.dev.yml ps

# View logs
docker compose -f docker-compose.dev.yml logs auth

# Restart services
./launch_docker.sh down
./launch_docker.sh dev --seed
```

### Seeding Fails

```bash
# Try with database reset
./launch_docker.sh dev --reset-db --seed

# Check individual service logs
docker compose -f docker-compose.dev.yml logs <service-name>
```

### Cannot Login

```bash
# Verify users exist
docker compose -f docker-compose.dev.yml exec postgres psql -U dev -d dentalos_auth -c "SELECT email FROM users;"

# Re-seed users
./seed-local-data.sh --auth-only
```

## Documentation

For detailed information:

- **TEST_USERS.md** - Complete user credentials and permissions
- **SEEDING_GUIDE.md** - Full seeding documentation
- **SEED_SUMMARY.txt** - Quick reference card

## Important Notes

- **Development Only**: Never use these credentials in production
- **Idempotent Design**: Safe to run multiple times
- **Proper Security**: Passwords are properly hashed with bcrypt
- **Multi-Tenant**: All data is scoped to test organization

## Next Steps

1. Start services with seeding:
   ```bash
   ./launch_docker.sh dev --seed
   ```

2. Open browser: http://localhost:5173

3. Log in with test credentials (see table above)

4. Start developing!

---

For more information, see:
- [TEST_USERS.md](TEST_USERS.md) - User details
- [SEEDING_GUIDE.md](SEEDING_GUIDE.md) - Complete guide
- [QUICK_START.md](QUICK_START.md) - Getting started
