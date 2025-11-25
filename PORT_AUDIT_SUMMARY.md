# DentalOS Port Audit Summary
## Audit Date: 2025-11-24

## CRITICAL INCONSISTENCIES FOUND AND FIXED

### 1. docker-compose.yml (Production)
**Before:** Services used sequential ports 3001-3010
**After:** Services now use PORT REGISTRY standard ports
- Auth: 3001 → 3001 (no change)
- Patient: 3002 → 3004 (FIXED)
- Scheduling: 3003 → 3002 (FIXED)
- Clinical: 3004 → 3005 (FIXED)
- Billing: 3005 → 3010 (FIXED)
- Inventory: 3006 → 3008 (FIXED)
- Subscription: 3007 → 3011 (FIXED)
- Enterprise: 3008 → 3017 (FIXED)
- Provider-Schedule: 3009 → 3003 (FIXED)
- Health-Aggregator: 3010 → 3099 (FIXED)

### 2. docker-compose.dev.yml
**Issues Fixed:**
- PORT environment variables were using HOST ports (33xx) instead of INTERNAL ports (30xx)
- Healthcheck URLs were using HOST ports instead of INTERNAL ports
- All service URLs in health-aggregator were updated to correct internal ports

### 3. Service .env Files
**Before:** All services used HOST ports (e.g., 3301, 3304, 3302)
**After:** All services use INTERNAL container ports (e.g., 3001, 3004, 3002)

Fixed ports in:
- backend-auth/.env: 3301 → 3001
- backend-billing-service/.env: 3310 → 3010
- backend-clinical/.env: 3305 → 3005
- backend-enterprise-service/.env: 3317 → 3017
- backend-health-aggregator/.env: 3399 → 3099
- backend-inventory-service/.env: 3308 → 3008
- backend-patient-service/.env: 3304 → 3004
- backend-provider-schedule/.env: 3303 → 3003
- backend-scheduling/.env: 3302 → 3002
- backend-subscription-service/.env: 3311 → 3011

### 4. Root .env Files
**Fixed:**
- .env.docker: VITE_AUTH_API_URL changed from 3001 → 3301 (uses HOST port)
- .env.example: HOST_WEB_PORT changed from 55173 → 5173

### 5. Infrastructure Services
**Redis:**
- docker-compose.yml had HOST_REDIS_PORT default 6380
- Changed to 6381 to match .env.docker and .env.example

## AUTHORITATIVE PORT REGISTRY CREATED

Created `/PORT_REGISTRY.txt` as the single source of truth for ALL port assignments.

### Backend Services (INTERNAL Container Ports)
- AUTH_PORT=3001
- SCHEDULING_PORT=3002
- PROVIDER_PORT=3003
- PATIENT_PORT=3004
- CLINICAL_PORT=3005
- INVENTORY_PORT=3008
- BILLING_PORT=3010
- SUBSCRIPTION_PORT=3011
- ENTERPRISE_PORT=3017
- HEALTH_AGGREGATOR_PORT=3099

### Backend Services (HOST Port Mappings)
- HOST_AUTH_PORT=3301
- HOST_SCHEDULING_PORT=3302
- HOST_PROVIDER_PORT=3303
- HOST_PATIENT_PORT=3304
- HOST_CLINICAL_PORT=3305
- HOST_INVENTORY_PORT=3308
- HOST_BILLING_PORT=3310
- HOST_SUBSCRIPTION_PORT=3311
- HOST_ENTERPRISE_PORT=3317
- HOST_HEALTH_AGGREGATOR_PORT=3399

### Frontend
- WEB_PORT=5173 (internal)
- HOST_WEB_PORT=5173 (external - same as internal)

### Infrastructure Services (INTERNAL)
- POSTGRES_PORT=5432
- MONGO_PORT=27017
- REDIS_PORT=6379
- RABBITMQ_PORT=5672
- RABBITMQ_MGMT_PORT=15672
- MINIO_PORT=9000
- MINIO_CONSOLE_PORT=9001

### Infrastructure Services (HOST Mappings)
- HOST_POSTGRES_PORT=5433
- HOST_POSTGRES_SUBSCRIPTION_PORT=5434
- HOST_MONGO_PORT=27018
- HOST_REDIS_PORT=6381
- HOST_RABBITMQ_PORT=5672
- HOST_RABBITMQ_MANAGEMENT_PORT=15672
- HOST_MINIO_API_PORT=9000
- HOST_MINIO_CONSOLE_PORT=9001

## FILES MODIFIED

### Configuration Files
1. `/PORT_REGISTRY.txt` - CREATED (authoritative port registry)
2. `/.env.docker` - FIXED VITE_AUTH_API_URL
3. `/.env.example` - FIXED HOST_WEB_PORT
4. `/docker-compose.yml` - FIXED all service ports and URLs
5. `/docker-compose.dev.yml` - FIXED PORT env vars and healthcheck URLs

### Service .env Files (10 files)
6. `/apps/backend-auth/.env`
7. `/apps/backend-billing-service/.env`
8. `/apps/backend-clinical/.env`
9. `/apps/backend-enterprise-service/.env`
10. `/apps/backend-health-aggregator/.env`
11. `/apps/backend-inventory-service/.env`
12. `/apps/backend-patient-service/.env`
13. `/apps/backend-provider-schedule/.env`
14. `/apps/backend-scheduling/.env`
15. `/apps/backend-subscription-service/.env`

## VERIFICATION NOTES

### Scripts Already Correct
- `test-health-all.sh` - Uses correct HOST ports (33xx, 3399)
- `seed-local-data.sh` - Uses correct HOST ports (3301, 3304, 3302, 3305, 3311)

### Key Principles Applied
1. **INTERNAL ports** (e.g., 3001-3099) are used INSIDE Docker containers
2. **HOST ports** (e.g., 3301-3399) are exposed to the host machine  
3. Service URLs use Docker network names with INTERNAL ports (e.g., http://auth:3001)
4. Frontend (VITE_*) URLs use HOST ports since browser runs on host (e.g., http://localhost:3301)
5. Healthchecks inside containers use INTERNAL ports (e.g., localhost:3001)
6. Test scripts from host machine use HOST ports (e.g., localhost:3301)

## IMPACT ASSESSMENT

### Breaking Changes
- Services will need to be restarted with the new port configurations
- Any hardcoded port references in application code should be reviewed
- CI/CD pipelines may need updates if they reference old ports

### Non-Breaking Changes
- Configuration.ts and main.ts files use PORT environment variable, so no code changes needed
- Docker Compose will automatically use new port mappings

## RECOMMENDATIONS

1. **Restart all services** after pulling these changes
2. **Review application code** for any hardcoded port references
3. **Update any external documentation** referencing the old ports
4. **Refer to PORT_REGISTRY.txt** before making any future port changes
5. **Never modify ports** without updating ALL configuration files listed above

## CONSISTENCY VERIFICATION PASSED

All port configurations are now consistent across:
- ✅ Root .env files (.env.docker, .env.example)
- ✅ Docker Compose files (docker-compose.yml, docker-compose.dev.yml)
- ✅ Service .env files (all 10 backend services)
- ✅ Test scripts (test-health-all.sh, seed-local-data.sh)
- ✅ PORT_REGISTRY.txt (authoritative source)

---
**Audit completed successfully. All port inconsistencies have been resolved.**
