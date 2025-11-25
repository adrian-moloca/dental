#!/usr/bin/env bash

################################################################################
# DentalOS Local Development Seed Script
#
# This script seeds all services with test data for local development:
# - Subscription service: Modules and cabinets (must run FIRST)
# - Auth service: Test users (uses organizationId as simple UUID reference)
# - Patient service: Sample patients
# - Scheduling service: Sample appointments
# - Clinical service: Sample treatments
#
# Note: There is NO central organizations table. Each service uses organizationId
# as a UUID column for multi-tenant filtering. The subscription service creates
# cabinets which reference organizationIds, but doesn't enforce foreign keys.
#
# Features:
# - Idempotent: Safe to run multiple times
# - Waits for services to be healthy before seeding
# - Color-coded output for better readability
# - Error handling with meaningful messages
#
# Usage:
#   ./seed-local-data.sh                  # Seed all services
#   ./seed-local-data.sh --auth-only      # Seed auth service only
#   ./seed-local-data.sh --no-wait        # Skip health checks
#
################################################################################

set -e  # Exit on any error

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Default values
WAIT_FOR_HEALTH=true
SEED_AUTH=true
SEED_SUBSCRIPTION=true
SEED_PATIENT=true
SEED_SCHEDULING=true
SEED_CLINICAL=true

# Test organization IDs (UUIDs)
TEST_ORG_ID="00000000-0000-0000-0000-000000000001"
TEST_CLINIC_ID="00000000-0000-0000-0000-000000000011"

# Service URLs from .env.docker
AUTH_URL="${AUTH_SERVICE_URL:-http://localhost:3301}"
SUBSCRIPTION_URL="${SUBSCRIPTION_SERVICE_URL:-http://localhost:3311}"
PATIENT_URL="${PATIENT_SERVICE_URL:-http://localhost:3304}"
SCHEDULING_URL="${SCHEDULING_SERVICE_URL:-http://localhost:3302}"
CLINICAL_URL="${CLINICAL_SERVICE_URL:-http://localhost:3305}"

################################################################################
# Helper Functions
################################################################################

print_header() {
  echo ""
  echo -e "${BLUE}========================================${NC}"
  echo -e "${BLUE}  $1${NC}"
  echo -e "${BLUE}========================================${NC}"
  echo ""
}

print_success() {
  echo -e "${GREEN}✓${NC} $1"
}

print_error() {
  echo -e "${RED}✗${NC} $1"
}

print_warning() {
  echo -e "${YELLOW}⚠${NC} $1"
}

print_info() {
  echo -e "${CYAN}ℹ${NC} $1"
}

# Parse command line arguments
parse_args() {
  for arg in "$@"; do
    case $arg in
      --no-wait)
        WAIT_FOR_HEALTH=false
        shift
        ;;
      --auth-only)
        SEED_SUBSCRIPTION=false
        SEED_PATIENT=false
        SEED_SCHEDULING=false
        SEED_CLINICAL=false
        shift
        ;;
      --help|-h)
        echo "Usage: $0 [options]"
        echo ""
        echo "Options:"
        echo "  --no-wait       Skip health checks (faster but risky)"
        echo "  --auth-only     Seed auth service only"
        echo "  --help, -h      Show this help message"
        echo ""
        exit 0
        ;;
      *)
        print_error "Unknown option: $arg"
        echo "Use --help for usage information"
        exit 1
        ;;
    esac
  done
}

# Wait for service to be healthy
wait_for_service() {
  local service_name=$1
  local health_url=$2
  local max_attempts=${3:-30}
  local attempt=0

  print_info "Waiting for $service_name to be healthy at $health_url..."
  print_info "Max wait time: $((max_attempts * 2)) seconds ($max_attempts attempts)"

  while [ $attempt -lt $max_attempts ]; do
    if curl -sf "$health_url" > /dev/null 2>&1; then
      echo ""
      print_success "$service_name is healthy"
      return 0
    fi

    attempt=$((attempt + 1))
    echo -n "."
    sleep 2
  done

  echo ""
  print_error "$service_name is not healthy after ${max_attempts} attempts ($((max_attempts * 2)) seconds)"
  print_error "Health check URL: $health_url"
  print_warning "Verify the service is running: docker compose -f docker-compose.dev.yml ps"
  print_warning "Check service logs: docker compose -f docker-compose.dev.yml logs $service_name"
  return 1
}

################################################################################
# Service Seeding Functions
################################################################################

seed_auth_service() {
  print_header "Seeding Auth Service"

  if [ "$WAIT_FOR_HEALTH" = true ]; then
    wait_for_service "Auth Service" "$AUTH_URL/api/v1/health" || return 1
  fi

  print_info "Creating test organization and users with proper password hashing..."

  # Use the TypeScript seeder which properly hashes passwords with bcrypt
  docker compose -f docker-compose.dev.yml exec -T auth sh -c "
    cd /workspace/apps/backend-auth &&
    npx ts-node -r tsconfig-paths/register src/database/seed-users.ts
  " 2>&1 | grep -v "ExperimentalWarning"

  if [ $? -eq 0 ]; then
    print_success "Auth service seeded successfully"
    echo ""
    print_info "Test Users Created:"
    echo "  - admin@dentalos.local (Admin)"
    echo "  - dentist@dentalos.local (Dentist)"
    echo "  - receptionist@dentalos.local (Receptionist)"
    echo "  - patient@dentalos.local (Patient)"
    echo "  Password for all: Password123!"
  else
    print_error "Failed to seed auth service"
    print_warning "Attempting fallback: Direct database insertion..."

    # Fallback to direct SQL with pre-computed Argon2id hash
    # This hash is Argon2id('Password123!') with standard parameters
    # Generated with: @node-rs/argon2 with m=65536, t=3, p=4
    # Note: Organizations table is in subscription service, not auth service
    docker compose -f docker-compose.dev.yml exec -T postgres psql -U dev -d dentalos_auth << 'EOSQL'
-- Seed test users
-- Password hash for 'Password123!' generated with: Argon2id(m=65536, t=3, p=4)
-- This is the CORRECT Argon2id hash that matches the password service implementation
INSERT INTO users (id, organization_id, clinic_id, email, password_hash, first_name, last_name, roles, permissions, status, email_verified, created_at, updated_at)
VALUES
  ('00000000-0000-0000-0000-000000000101', '00000000-0000-0000-0000-000000000001', NULL, 'admin@dentalos.local',
   '$argon2id$v=19$m=65536,t=3,p=4$cehvLSE1CAjtwqDvIt0iJA$Xa7SVcxWnvYfhhmwqeoEQY6d59BMFpp4Oe0WEBssyZo', 'Admin', 'User',
   '["SUPER_ADMIN", "CLINIC_ADMIN"]', '["*:*"]', 'ACTIVE', true, NOW(), NOW()),
  ('00000000-0000-0000-0000-000000000102', '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000011', 'dentist@dentalos.local',
   '$argon2id$v=19$m=65536,t=3,p=4$cehvLSE1CAjtwqDvIt0iJA$Xa7SVcxWnvYfhhmwqeoEQY6d59BMFpp4Oe0WEBssyZo', 'Dr. Jane', 'Smith',
   '["DENTIST"]', '["patients:read", "patients:write", "appointments:read", "appointments:write", "clinical:read", "clinical:write"]', 'ACTIVE', true, NOW(), NOW()),
  ('00000000-0000-0000-0000-000000000103', '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000011', 'receptionist@dentalos.local',
   '$argon2id$v=19$m=65536,t=3,p=4$cehvLSE1CAjtwqDvIt0iJA$Xa7SVcxWnvYfhhmwqeoEQY6d59BMFpp4Oe0WEBssyZo', 'Sarah', 'Johnson',
   '["RECEPTIONIST"]', '["patients:read", "patients:write", "appointments:read", "appointments:write"]', 'ACTIVE', true, NOW(), NOW()),
  ('00000000-0000-0000-0000-000000000104', '00000000-0000-0000-0000-000000000001', NULL, 'patient@dentalos.local',
   '$argon2id$v=19$m=65536,t=3,p=4$cehvLSE1CAjtwqDvIt0iJA$Xa7SVcxWnvYfhhmwqeoEQY6d59BMFpp4Oe0WEBssyZo', 'John', 'Doe',
   '["PATIENT"]', '["appointments:read:own", "clinical:read:own"]', 'ACTIVE', true, NOW(), NOW())
ON CONFLICT (email, organization_id) DO UPDATE SET
  password_hash = EXCLUDED.password_hash,
  roles = EXCLUDED.roles,
  permissions = EXCLUDED.permissions,
  status = EXCLUDED.status,
  updated_at = NOW();
EOSQL

    if [ $? -eq 0 ]; then
      print_success "Auth service seeded via fallback method"
      print_warning "Note: Passwords may need to be reset via auth service API"
    else
      print_error "Failed to seed auth service"
      return 1
    fi
  fi
}

seed_subscription_service() {
  print_header "Seeding Subscription Service"

  if [ "$WAIT_FOR_HEALTH" = true ]; then
    wait_for_service "Subscription Service" "$SUBSCRIPTION_URL/api/v1/health" || return 1
  fi

  print_info "Running subscription service seeders..."

  # Use existing subscription service seeder
  docker compose -f docker-compose.dev.yml exec -T subscription sh -c "
    cd /workspace/apps/backend-subscription-service &&
    npx ts-node -r tsconfig-paths/register src/database/seed.ts --orgs=$TEST_ORG_ID
  " 2>&1 | grep -v "ExperimentalWarning"

  if [ $? -eq 0 ]; then
    print_success "Subscription service seeded successfully"
    print_info "Modules and cabinets created for test organization"
  else
    print_error "Failed to seed subscription service"
    return 1
  fi
}

seed_patient_service() {
  print_header "Seeding Patient Service"

  if [ "$WAIT_FOR_HEALTH" = true ]; then
    wait_for_service "Patient Service" "$PATIENT_URL/api/v1/health" 60 || return 1
  fi

  print_info "Creating sample patients..."

  # Create sample patients via MongoDB
  docker compose -f docker-compose.dev.yml exec -T mongo mongosh patient << 'EOF'
// Seed sample patients
db.patients.insertMany([
  {
    _id: ObjectId("000000000000000000000001"),
    organizationId: "00000000-0000-0000-0000-000000000001",
    clinicId: "00000000-0000-0000-0000-000000000011",
    firstName: "Emma",
    lastName: "Wilson",
    email: "emma.wilson@example.com",
    phone: "+1-555-0101",
    dateOfBirth: new Date("1990-05-15"),
    gender: "FEMALE",
    address: {
      street: "123 Main St",
      city: "San Francisco",
      state: "CA",
      zipCode: "94102",
      country: "USA"
    },
    insurance: {
      provider: "Blue Cross",
      policyNumber: "BC123456",
      groupNumber: "GRP001"
    },
    medicalHistory: {
      allergies: ["Penicillin"],
      medications: [],
      conditions: []
    },
    status: "ACTIVE",
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    _id: ObjectId("000000000000000000000002"),
    organizationId: "00000000-0000-0000-0000-000000000001",
    clinicId: "00000000-0000-0000-0000-000000000011",
    firstName: "Michael",
    lastName: "Brown",
    email: "michael.brown@example.com",
    phone: "+1-555-0102",
    dateOfBirth: new Date("1985-08-22"),
    gender: "MALE",
    address: {
      street: "456 Oak Ave",
      city: "San Francisco",
      state: "CA",
      zipCode: "94103",
      country: "USA"
    },
    insurance: {
      provider: "Aetna",
      policyNumber: "AET789012",
      groupNumber: "GRP002"
    },
    medicalHistory: {
      allergies: [],
      medications: ["Aspirin"],
      conditions: ["Hypertension"]
    },
    status: "ACTIVE",
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    _id: ObjectId("000000000000000000000003"),
    organizationId: "00000000-0000-0000-0000-000000000001",
    clinicId: "00000000-0000-0000-0000-000000000011",
    firstName: "Sophia",
    lastName: "Davis",
    email: "sophia.davis@example.com",
    phone: "+1-555-0103",
    dateOfBirth: new Date("2010-03-10"),
    gender: "FEMALE",
    address: {
      street: "789 Pine St",
      city: "San Francisco",
      state: "CA",
      zipCode: "94104",
      country: "USA"
    },
    guardians: [
      {
        firstName: "Robert",
        lastName: "Davis",
        relationship: "FATHER",
        phone: "+1-555-0104",
        email: "robert.davis@example.com"
      }
    ],
    insurance: {
      provider: "Cigna",
      policyNumber: "CIG345678",
      groupNumber: "GRP003"
    },
    medicalHistory: {
      allergies: [],
      medications: [],
      conditions: []
    },
    status: "ACTIVE",
    isMinor: true,
    createdAt: new Date(),
    updatedAt: new Date()
  }
], { ordered: false });

print("Seeded 3 sample patients");
EOF

  if [ $? -eq 0 ]; then
    print_success "Patient service seeded successfully"
    print_info "Created 3 sample patients"
  else
    print_error "Failed to seed patient service"
    return 1
  fi
}

seed_scheduling_service() {
  print_header "Seeding Scheduling Service"

  if [ "$WAIT_FOR_HEALTH" = true ]; then
    wait_for_service "Scheduling Service" "$SCHEDULING_URL/api/v1/health" 60 || return 1
  fi

  print_info "Creating sample appointments..."

  # Create sample appointments via MongoDB
  docker compose -f docker-compose.dev.yml exec -T mongo mongosh "dental-scheduling" << 'EOF'
// Calculate dates
const today = new Date();
const tomorrow = new Date(today);
tomorrow.setDate(tomorrow.getDate() + 1);
const nextWeek = new Date(today);
nextWeek.setDate(nextWeek.getDate() + 7);

// Seed sample appointments
db.appointments.insertMany([
  {
    _id: ObjectId("100000000000000000000001"),
    organizationId: "00000000-0000-0000-0000-000000000001",
    clinicId: "00000000-0000-0000-0000-000000000011",
    patientId: "000000000000000000000001",
    providerId: "00000000-0000-0000-0000-000000000102",
    appointmentType: "CHECKUP",
    status: "SCHEDULED",
    startTime: new Date(tomorrow.setHours(9, 0, 0)),
    endTime: new Date(tomorrow.setHours(10, 0, 0)),
    duration: 60,
    notes: "Regular checkup and cleaning",
    createdBy: "00000000-0000-0000-0000-000000000102",
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    _id: ObjectId("100000000000000000000002"),
    organizationId: "00000000-0000-0000-0000-000000000001",
    clinicId: "00000000-0000-0000-0000-000000000011",
    patientId: "000000000000000000000002",
    providerId: "00000000-0000-0000-0000-000000000102",
    appointmentType: "FILLING",
    status: "SCHEDULED",
    startTime: new Date(tomorrow.setHours(14, 0, 0)),
    endTime: new Date(tomorrow.setHours(15, 30, 0)),
    duration: 90,
    notes: "Filling for cavity on tooth #18",
    createdBy: "00000000-0000-0000-0000-000000000103",
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    _id: ObjectId("100000000000000000000003"),
    organizationId: "00000000-0000-0000-0000-000000000001",
    clinicId: "00000000-0000-0000-0000-000000000011",
    patientId: "000000000000000000000003",
    providerId: "00000000-0000-0000-0000-000000000102",
    appointmentType: "CONSULTATION",
    status: "SCHEDULED",
    startTime: new Date(nextWeek.setHours(10, 0, 0)),
    endTime: new Date(nextWeek.setHours(10, 30, 0)),
    duration: 30,
    notes: "Initial consultation for braces (minor patient)",
    createdBy: "00000000-0000-0000-0000-000000000103",
    createdAt: new Date(),
    updatedAt: new Date()
  }
], { ordered: false });

print("Seeded 3 sample appointments");
EOF

  if [ $? -eq 0 ]; then
    print_success "Scheduling service seeded successfully"
    print_info "Created 3 sample appointments"
  else
    print_error "Failed to seed scheduling service"
    return 1
  fi
}

seed_clinical_service() {
  print_header "Seeding Clinical Service"

  if [ "$WAIT_FOR_HEALTH" = true ]; then
    wait_for_service "Clinical Service" "$CLINICAL_URL/api/v1/health" 60 || return 1
  fi

  print_info "Creating sample clinical records..."

  # Create sample clinical records via MongoDB
  docker compose -f docker-compose.dev.yml exec -T mongo mongosh dentalos_clinical << 'EOF'
// Seed sample clinical notes
db.clinical_notes.insertMany([
  {
    _id: ObjectId("200000000000000000000001"),
    organizationId: "00000000-0000-0000-0000-000000000001",
    clinicId: "00000000-0000-0000-0000-000000000011",
    patientId: "000000000000000000000001",
    providerId: "00000000-0000-0000-0000-000000000102",
    appointmentId: "100000000000000000000001",
    noteType: "PROGRESS_NOTE",
    chiefComplaint: "Routine checkup",
    subjective: "Patient reports no issues, regular dental hygiene",
    objective: "All teeth present, no visible decay, gums healthy",
    assessment: "Good oral health",
    plan: "Continue regular hygiene, schedule next checkup in 6 months",
    treatments: [
      {
        code: "D1110",
        description: "Prophylaxis - Adult",
        toothNumber: null,
        status: "COMPLETED"
      }
    ],
    createdBy: "00000000-0000-0000-0000-000000000102",
    createdAt: new Date(),
    updatedAt: new Date()
  }
], { ordered: false });

// Seed sample odontogram
db.odontograms.insertMany([
  {
    _id: ObjectId("300000000000000000000001"),
    organizationId: "00000000-0000-0000-0000-000000000001",
    clinicId: "00000000-0000-0000-0000-000000000011",
    patientId: "000000000000000000000001",
    teeth: [
      {
        toothNumber: 18,
        status: "HEALTHY",
        conditions: [],
        surfaces: {
          occlusal: "HEALTHY",
          mesial: "HEALTHY",
          distal: "HEALTHY",
          buccal: "HEALTHY",
          lingual: "HEALTHY"
        }
      },
      {
        toothNumber: 19,
        status: "RESTORED",
        conditions: ["FILLING"],
        surfaces: {
          occlusal: "FILLED",
          mesial: "HEALTHY",
          distal: "HEALTHY",
          buccal: "HEALTHY",
          lingual: "HEALTHY"
        }
      }
    ],
    createdBy: "00000000-0000-0000-0000-000000000102",
    createdAt: new Date(),
    updatedAt: new Date()
  }
], { ordered: false });

print("Seeded clinical records and odontogram");
EOF

  if [ $? -eq 0 ]; then
    print_success "Clinical service seeded successfully"
    print_info "Created sample clinical notes and odontogram"
  else
    print_error "Failed to seed clinical service"
    return 1
  fi
}

################################################################################
# Main Execution
################################################################################

main() {
  parse_args "$@"

  print_header "DentalOS Local Data Seeding"
  print_info "Starting seed process..."
  echo ""

  # Track failures
  local failed_services=()

  # Seed services in order - subscription MUST run before auth
  # because users reference organizationIds that are used by cabinets
  if [ "$SEED_SUBSCRIPTION" = true ]; then
    seed_subscription_service || failed_services+=("Subscription")
  fi

  if [ "$SEED_AUTH" = true ]; then
    seed_auth_service || failed_services+=("Auth")
  fi

  if [ "$SEED_PATIENT" = true ]; then
    seed_patient_service || failed_services+=("Patient")
  fi

  if [ "$SEED_SCHEDULING" = true ]; then
    seed_scheduling_service || failed_services+=("Scheduling")
  fi

  if [ "$SEED_CLINICAL" = true ]; then
    seed_clinical_service || failed_services+=("Clinical")
  fi

  # Final summary
  print_header "Seeding Summary"

  if [ ${#failed_services[@]} -eq 0 ]; then
    print_success "All services seeded successfully!"
    echo ""
    print_info "Test Credentials:"
    echo "  - Admin:        admin@dentalos.local / Password123!"
    echo "  - Dentist:      dentist@dentalos.local / Password123!"
    echo "  - Receptionist: receptionist@dentalos.local / Password123!"
    echo "  - Patient:      patient@dentalos.local / Password123!"
    echo ""
    print_info "You can now log in to the application with these credentials"
    exit 0
  else
    print_error "Failed to seed: ${failed_services[*]}"
    exit 1
  fi
}

# Run main function
main "$@"
