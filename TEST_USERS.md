# Test Users for DentalOS Local Development

This document contains test user credentials for local development. These accounts are created automatically by the seed script.

## Quick Start

Run the seed script to create these test users:

```bash
./seed-local-data.sh
```

Or with Docker Compose:

```bash
./launch_docker.sh dev --seed
```

---

## Test User Credentials

### 1. Admin User

**Email:** `admin@dentalos.local`
**Password:** `Password123!`

**Role:** Super Admin, Clinic Admin
**Permissions:** Full system access (`*:*`)

**Use Cases:**
- System configuration and settings
- User management (create/edit/delete users)
- Organization and clinic management
- Access to all modules and features
- Subscription and billing management
- Audit log viewing

**Test Scenarios:**
- Create new users and assign roles
- Configure system-wide settings
- Manage organization subscription
- View system analytics and reports

---

### 2. Dentist User

**Email:** `dentist@dentalos.local`
**Password:** `Password123!`

**Role:** Dentist
**Permissions:**
- `patients:read`, `patients:write`
- `appointments:read`, `appointments:write`
- `clinical:read`, `clinical:write`

**Use Cases:**
- View and manage patient records
- Create and update clinical notes
- Manage odontograms and treatment plans
- Schedule and manage appointments
- Perform treatments and procedures
- Review patient history and medical records

**Test Scenarios:**
- Create clinical notes for appointments
- Update patient odontograms
- Schedule follow-up appointments
- Review patient treatment history
- Generate treatment plans

---

### 3. Receptionist User

**Email:** `receptionist@dentalos.local`
**Password:** `Password123!`

**Role:** Receptionist
**Permissions:**
- `patients:read`, `patients:write`
- `appointments:read`, `appointments:write`

**Use Cases:**
- Register new patients
- Schedule appointments
- Check-in patients for appointments
- Update patient contact information
- Manage appointment calendar
- Send appointment reminders

**Test Scenarios:**
- Register a new patient walk-in
- Schedule multiple appointments for a patient
- Handle appointment cancellations and rescheduling
- Check-in patients at front desk
- Update patient insurance information

**Limitations:**
- Cannot access clinical notes or odontograms
- Cannot perform treatments or procedures
- Limited access to sensitive medical information

---

### 4. Patient User

**Email:** `patient@dentalos.local`
**Password:** `Password123!`

**Role:** Patient
**Permissions:**
- `appointments:read:own` (own appointments only)
- `clinical:read:own` (own clinical records only)

**Use Cases:**
- View own appointment history
- Book available appointment slots (if online booking enabled)
- View own clinical notes (limited information)
- Update contact and insurance information
- Receive appointment reminders

**Test Scenarios:**
- Log in to patient portal
- View upcoming appointments
- Request appointment cancellation
- Update contact information
- View treatment history (sanitized)

**Limitations:**
- Can only access own data (no other patients)
- Cannot access administrative features
- Cannot access other users' information
- Cannot modify clinical records

---

## Sample Data

When you run the seed script, the following sample data is also created:

### Sample Patients

1. **Emma Wilson** - Female, DOB: 1990-05-15
   - Insurance: Blue Cross (BC123456)
   - Allergies: Penicillin
   - Phone: +1-555-0101

2. **Michael Brown** - Male, DOB: 1985-08-22
   - Insurance: Aetna (AET789012)
   - Medications: Aspirin
   - Conditions: Hypertension
   - Phone: +1-555-0102

3. **Sophia Davis** - Female, DOB: 2010-03-10 (Minor)
   - Guardian: Robert Davis (Father)
   - Insurance: Cigna (CIG345678)
   - Phone: +1-555-0103

### Sample Appointments

1. **Tomorrow 9:00 AM** - Emma Wilson - Checkup (Dr. Jane Smith)
2. **Tomorrow 2:00 PM** - Michael Brown - Filling (Dr. Jane Smith)
3. **Next Week 10:00 AM** - Sophia Davis - Consultation for braces (Dr. Jane Smith)

### Sample Clinical Records

- **Emma Wilson**: Completed prophylaxis with progress note
- **Odontogram**: Sample tooth chart with healthy and restored teeth

---

## Test Organization Details

All test users belong to the same test organization:

**Organization ID:** `00000000-0000-0000-0000-000000000001`
**Organization Name:** Test Dental Clinic
**Clinic ID:** `00000000-0000-0000-0000-000000000011`

---

## Password Policy

Test passwords use a simple policy for development convenience:

- Minimum 8 characters
- Contains uppercase and lowercase letters
- Contains at least one number
- Contains at least one special character

**Production Note:** In production, enforce stronger password policies:
- Minimum 12 characters
- Password complexity requirements
- Password expiration (90 days)
- Password history (prevent reuse)
- Account lockout after failed attempts

---

## Security Notes

### Development Only

These credentials are for **local development only** and should NEVER be used in production or staging environments.

### Password Hashing

Passwords are hashed using bcrypt with a cost factor of 10:

```typescript
import * as bcrypt from 'bcrypt';
const hash = await bcrypt.hash('Password123!', 10);
```

### JWT Secrets

Ensure your `.env.docker` file has secure JWT secrets:

```env
JWT_ACCESS_SECRET=dev-access-secret-32chars-min-123456789012
JWT_REFRESH_SECRET=dev-refresh-secret-32chars-min-123456789012
DEVICE_TOKEN_SECRET=dev-device-secret-32chars-min-123456789012
```

**Production Note:** Generate cryptographically secure random secrets:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

---

## Troubleshooting

### Users Not Created

If users are not created after running the seed script:

1. Check if auth service is running:
   ```bash
   docker compose -f docker-compose.dev.yml ps auth
   ```

2. Check auth service logs:
   ```bash
   docker compose -f docker-compose.dev.yml logs auth
   ```

3. Verify database connection:
   ```bash
   docker compose -f docker-compose.dev.yml exec postgres psql -U dev -d dentalos_auth -c "\dt"
   ```

4. Run seed script with verbose output:
   ```bash
   bash -x ./seed-local-data.sh
   ```

### Login Failures

If you cannot log in with test credentials:

1. Verify user exists in database:
   ```bash
   docker compose -f docker-compose.dev.yml exec postgres psql -U dev -d dentalos_auth -c "SELECT email, status FROM users;"
   ```

2. Check password hash is set:
   ```bash
   docker compose -f docker-compose.dev.yml exec postgres psql -U dev -d dentalos_auth -c "SELECT email, LENGTH(password_hash) as hash_length FROM users;"
   ```

3. Verify JWT secrets are configured in `.env.docker`

4. Check auth service logs for authentication errors

### Resetting Test Data

To reset all test data and re-seed:

```bash
# Stop services
./launch_docker.sh down

# Reset databases
./launch_docker.sh dev --reset-db

# Wait for services to start (about 60 seconds)
sleep 60

# Re-seed data
./seed-local-data.sh
```

---

## API Testing

### Using cURL

```bash
# Login as admin
curl -X POST http://localhost:3301/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@dentalos.local",
    "password": "Password123!"
  }'

# Use access token in subsequent requests
TOKEN="<access_token_from_login>"

curl -X GET http://localhost:3301/api/v1/users \
  -H "Authorization: Bearer $TOKEN"
```

### Using Postman

1. Import collection from `docs/postman/DentalOS.postman_collection.json` (if exists)
2. Create environment variables:
   - `base_url`: `http://localhost:3301`
   - `email`: `admin@dentalos.local`
   - `password`: `Password123!`
3. Run "Login" request to get access token
4. Token is automatically saved to `access_token` variable
5. All subsequent requests use this token

---

## Additional Resources

- [Quick Start Guide](QUICK_START.md)
- [Docker Commands](DOCKER_COMMANDS.md)
- [Setup Summary](SETUP_SUMMARY.md)
- [API Documentation](http://localhost:3301/api/docs) (when services running)

---

**Last Updated:** 2025-11-24
**Maintained By:** DentalOS Development Team
