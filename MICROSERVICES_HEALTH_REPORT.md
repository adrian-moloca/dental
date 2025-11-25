# DentalOS Microservices Health & Startup Report
**Generated:** 2025-11-24
**Status:** All services currently DOWN (Ready to start)

---

## Executive Summary

All microservices are currently stopped and ready for deployment. The system is properly configured with:
- 10 application microservices
- 6 infrastructure services
- All ports are available (no conflicts)
- Docker compose configurations are valid
- Launch scripts are functional

---

## SERVICE CONFIGURATION VERIFICATION

### Application Microservices

| Service | Internal Port | Host Port | Database | Dependencies | Healthcheck |
|---------|---------------|-----------|----------|--------------|-------------|
| **auth** | 3001 | 3301 | PostgreSQL | postgres, redis, rabbitmq | GET /api/v1/health |
| **scheduling** | 3002 | 3302 | MongoDB | mongo, redis | GET /api/v1/health |
| **provider-schedule** | 3003 | 3303 | MongoDB | mongo | GET /api/v1/health |
| **patient** | 3004 | 3304 | MongoDB | mongo, redis | GET /api/v1/health |
| **clinical** | 3005 | 3305 | MongoDB | mongo, redis | GET /api/v1/health |
| **inventory** | 3008 | 3308 | MongoDB, MinIO | mongo, redis, minio | GET /api/v1/health |
| **billing** | 3010 | 3310 | MongoDB | mongo, redis | GET /api/v1/health |
| **subscription** | 3011 | 3311 | PostgreSQL | postgres-subscription, redis | GET /api/v1/health |
| **enterprise** | 3017 | 3317 | MongoDB | mongo, redis | GET /api/v1/health |
| **health-aggregator** | 3099 | 3399 | None (aggregator) | all services | GET /api/v1/health |

### Infrastructure Services

| Service | Port(s) | Container Port | Type | Config |
|---------|---------|---------------|----|--------|
| **postgres** (Auth DB) | 5433 | 5432 | PostgreSQL 16 | pgdata volume |
| **postgres-subscription** | 5434 | 5432 | PostgreSQL 16 | pgdata-subscription volume |
| **redis** | 6381 | 6379 | Redis 7 | redisdata volume, auth required |
| **mongo** | 27018 | 27017 | MongoDB 6 | mongodata volume |
| **rabbitmq** | 5672, 15672 | 5672, 15672 | RabbitMQ 3.13 | rabbitmqdata volume, mgmt UI |
| **minio** | 9000, 9001 | 9000, 9001 | MinIO (S3 API) | miniodata volume |

---

## CURRENT STATUS

### Port Availability Check
```
✓ All required ports are available (no conflicts detected)
✓ Port 3301-3399: Available for services
✓ Port 5433-5434: Available for PostgreSQL instances
✓ Port 6381: Available for Redis
✓ Port 27018: Available for MongoDB
✓ Port 5672, 15672: Available for RabbitMQ
✓ Port 9000, 9001: Available for MinIO
```

### Container Status
```
✗ All 10 application services: DOWN
✗ All 6 infrastructure services: DOWN
✗ Bootstrap container: Not started
✗ Web frontend: DOWN
```

### Network Configuration
```
✓ Docker network 'dental-dev' ready (configured in docker-compose.dev.yml)
✓ All services configured to connect via internal network
✓ Cross-service communication via DNS names (e.g., http://auth:3001)
```

---

## SERVICE DEPENDENCIES GRAPH

```
┌─────────────────────────────────────────────────────────────────┐
│                      Infrastructure Layer                        │
├─────────────────────────────────────────────────────────────────┤
│  postgres    postgres-subscription    redis    mongo    rabbitmq │
└────────┬─────────────────┬───────────┬──────┬──────────┬────────┘
         │                 │           │      │          │
         │                 │           │      │          │
┌────────▼────┐    ┌──────▼────────┐  │      │          │
│   auth       │    │ subscription  │  │      │          │
│ (3001:3301)  │    │(3011:3311)    │  │      │          │
└──────────────┘    └───────────────┘  │      │          │
                                        │      │          │
                    ┌───────────────────┘      │          │
                    │                          │          │
         ┌──────────┴──────────┬───────────┐   │          │
         │                     │           │   │          │
      ┌──▼────┐    ┌────────┬──▼──┐   ┌───▼─┐ │ ┌──────┐ │
      │patient │    │clinical│inven│   │bill │ │ │enter │ │
      │(3304)  │    │(3305)  │tory │   │(331 │ │ │prise │ │
      └────────┘    │        │(330 │   │0)   │ │ │(3317)│ │
                    │        │8)   │   └─────┘ │ └──────┘ │
                    └────────┴─────┴───────────┴──────────┘
                            │
                    ┌───────┴────────┐
                    │                │
              ┌─────▼────┐    ┌──────▼───────┐
              │scheduling │    │provider-sch  │
              │ (3302)    │    │(3303)        │
              └───────────┘    └──────────────┘
                    │
         ┌──────────┴──────────────────────────────┐
         │                                          │
    ┌────▼────────────────────────────────────┐   │
    │    health-aggregator (3099:3399)        │   │
    │    Monitors ALL service health endpoints    │
    └─────────────────────────────────────────┘   │
         │
      ┌──▼─────┐
      │   Web   │
      │  (5173) │
      └─────────┘
```

---

## STARTUP INSTRUCTIONS

### Quick Start (Development Environment with Hot Reload)

```bash
cd /home/adrian/Desktop/SBD-Projects/personal/preclinic/dental
./launch_docker.sh dev --wait
```

**What this does:**
- Validates .env.docker configuration
- Runs bootstrap (installs dependencies, builds shared packages) if needed
- Starts all infrastructure services (postgres, redis, mongo, rabbitmq, minio)
- Starts all 10 application services with hot-reload enabled
- Waits for all services to become healthy (60-90 seconds)
- Displays logs

### Fresh Start with Database Reset

```bash
./launch_docker.sh dev --reset-db --wait
```

**What this does:**
- Removes all database volumes
- Creates fresh databases
- Installs fresh dependencies
- Starts all services
- Seeds test data if needed

### Production-like Testing

```bash
./launch_docker.sh docker --wait
```

**What this does:**
- Uses docker-compose.yml instead of docker-compose.dev.yml
- Builds production-like containers
- Disables hot-reload
- Starts all services as they would run in production

### Clean Installation (if dependencies are broken)

```bash
./launch_docker.sh --install
```

**What this does:**
- Cleans pnpm cache completely
- Removes all node_modules directories
- Removes all dist build folders
- Reinstalls everything from scratch
- Takes 5-10 minutes

### Stop All Services

```bash
./launch_docker.sh down
```

---

## HEALTH ENDPOINT TESTING

Once services are running, test health endpoints:

```bash
# Test individual services
curl http://localhost:3301/api/v1/health      # auth
curl http://localhost:3302/api/v1/health      # scheduling
curl http://localhost:3303/api/v1/health      # provider-schedule
curl http://localhost:3304/api/v1/health      # patient
curl http://localhost:3305/api/v1/health      # clinical
curl http://localhost:3308/api/v1/health      # inventory
curl http://localhost:3310/api/v1/health      # billing
curl http://localhost:3311/api/v1/health      # subscription
curl http://localhost:3317/api/v1/health      # enterprise
curl http://localhost:3399/api/v1/health      # health-aggregator

# Test infrastructure services
curl http://localhost:5433               # postgres
curl http://localhost:6381               # redis (may need auth)
curl http://localhost:27018              # mongo
curl http://localhost:5672               # rabbitmq
curl http://localhost:15672              # rabbitmq management UI
curl http://localhost:9000               # minio API
curl http://localhost:9001               # minio console

# Web frontend
http://localhost:5173
```

---

## DOCKER COMPOSE ANALYSIS

### Validated Configuration Points

✓ **Service Names**: All services properly named for DNS resolution
✓ **Port Mapping**: All host ports correctly mapped (HOST:INTERNAL)
✓ **Environment Variables**: All services configured via .env.docker
✓ **Dependencies**: Health-based dependencies configured
  - `condition: service_healthy` ensures dependencies are ready before dependent services start
  - Health checks defined with appropriate intervals and timeouts
✓ **Volumes**:
  - Database volumes (pgdata, pgdata-subscription, mongodata)
  - Cache volumes (redisdata)
  - Message queue volumes (rabbitmqdata)
  - Object storage volumes (miniodata)
  - Package cache (pnpm-store)
✓ **Network**: Single `dental-dev` network for all services
✓ **Working Directory**: /workspace (mounted via current directory)
✓ **Commands**:
  - App services use `npx nodemon` for hot-reload
  - Web uses `npm run dev -- --host --port 5173`

### Health Check Configuration

All application services have health checks configured:
```
Interval: 30 seconds
Timeout: 10 seconds
Retries: 3
Start period: 60 seconds (grace period before first check)
```

All infrastructure services have health checks:
```
PostgreSQL:
  - Interval: 10s | Timeout: 5s | Retries: 5 | Start: 30s
  - Command: pg_isready check

Redis:
  - Interval: 10s | Timeout: 3s | Retries: 5 | Start: 20s
  - Command: redis-cli ping

MongoDB:
  - Interval: 10s | Timeout: 5s | Retries: 5 | Start: 40s
  - Command: mongosh admin.ping()

RabbitMQ:
  - Interval: 15s | Timeout: 10s | Retries: 5 | Start: 30s
  - Command: rabbitmq-diagnostics ping

MinIO:
  - Interval: 15s | Timeout: 5s | Retries: 3 | Start: 20s
  - Command: curl health endpoint
```

---

## STARTUP SEQUENCE

The services will start in this order (due to depends_on conditions):

### Phase 1: Infrastructure (Parallel - 0-60 seconds)
1. PostgreSQL (postgres) - waits for health check (30s startup + checks)
2. PostgreSQL Subscription (postgres-subscription)
3. Redis - waits for health check (20s startup)
4. MongoDB - waits for health check (40s startup)
5. RabbitMQ - waits for health check (30s startup)
6. MinIO - waits for health check (20s startup)

### Phase 2: Bootstrap (if needed - 3-5 minutes)
- Install pnpm dependencies
- Build shared packages in correct order:
  1. @dentalos/shared-types
  2. @dentalos/shared-domain
  3. @dentalos/shared-validation
  4. @dentalos/shared-auth
  5. @dentalos/shared-errors
  6. @dentalos/shared-events
  7. @dentalos/shared-infra
  8. @dentalos/shared-security
  9. @dentalos/shared-testing
  10. @dentalos/shared-tracing

### Phase 3: Core Services (Parallel - 60-120 seconds)
- Starts after infrastructure is healthy
- Services with dependencies start once their dependencies are healthy:
  - **auth**: starts after postgres, redis, rabbitmq healthy
  - **scheduling**: starts after mongo, redis healthy
  - **provider-schedule**: starts after mongo healthy
  - **patient**: starts after mongo, redis healthy
  - **clinical**: starts after mongo, redis healthy
  - **inventory**: starts after mongo, redis, minio healthy
  - **billing**: starts after mongo, redis healthy
  - **subscription**: starts after postgres-subscription, redis healthy
  - **enterprise**: starts after mongo, redis healthy

### Phase 4: Aggregator Service (120-150 seconds)
- **health-aggregator**: starts after all core services are available
- Monitors health of all services

### Phase 5: Frontend (depends on auth, patient, scheduling)
- **web**: Vite dev server on port 5173

**Total startup time:** 5-10 minutes (depends on bootstrap)

---

## PORT MAPPING REFERENCE

### Application Service Ports

| Service | External | Internal | Purpose |
|---------|----------|----------|---------|
| Auth | 3301 | 3001 | Authentication & user management |
| Scheduling | 3302 | 3002 | Appointment scheduling |
| Provider Schedule | 3303 | 3003 | Provider availability |
| Patient | 3304 | 3004 | Patient records & profiles |
| Clinical | 3305 | 3005 | Clinical notes & records |
| Inventory | 3308 | 3008 | Stock & supplies management |
| Billing | 3310 | 3010 | Billing & payments |
| Subscription | 3311 | 3011 | Subscription management |
| Enterprise | 3317 | 3017 | Enterprise features |
| Health Aggregator | 3399 | 3099 | Central health monitoring |
| Web Frontend | 5173 | 5173 | React/Vite dev server |

### Infrastructure Service Ports

| Service | External | Internal | Purpose |
|---------|----------|----------|---------|
| PostgreSQL (Auth) | 5433 | 5432 | Auth database |
| PostgreSQL (Subscription) | 5434 | 5432 | Subscription database |
| Redis | 6381 | 6379 | Caching & sessions |
| MongoDB | 27018 | 27017 | NoSQL database |
| RabbitMQ AMQP | 5672 | 5672 | Message queue |
| RabbitMQ Mgmt | 15672 | 15672 | Web management console |
| MinIO S3 API | 9000 | 9000 | Object storage API |
| MinIO Console | 9001 | 9001 | Web storage console |

---

## ENVIRONMENT CONFIGURATION

**Configuration Source:** `/home/adrian/Desktop/SBD-Projects/personal/preclinic/dental/.env.docker`

### Key Environment Variables

**Database:**
- `POSTGRES_USER=dev`
- `POSTGRES_PASSWORD=dev`
- `POSTGRES_DB=dentalos_auth`
- `POSTGRES_HOST=postgres`
- `POSTGRES_PORT=5432`
- `POSTGRES_SUBSCRIPTION_DB=dentalos_subscription`
- `POSTGRES_SUBSCRIPTION_HOST=postgres-subscription`

**NoSQL:**
- `MONGO_HOST=mongo`
- `MONGO_PORT=27017`
- `MONGO_URI_*` configured for each database

**Caching:**
- `REDIS_HOST=redis`
- `REDIS_PORT=6379`
- `REDIS_PASSWORD=devredis`

**Message Queue:**
- `RABBITMQ_HOST=rabbitmq`
- `RABBITMQ_USER=dev`
- `RABBITMQ_PASS=dev`
- `RABBITMQ_URI=amqp://dev:dev@rabbitmq:5672/`

**Object Storage (MinIO):**
- `MINIO_ENDPOINT=http://minio:9000`
- `MINIO_ACCESS_KEY=minioadmin`
- `MINIO_SECRET_KEY=minioadmin`
- `MINIO_BUCKET=dentalos-local`

**Security:**
- `JWT_ACCESS_SECRET=dev-access-secret-32chars-min-123456789012`
- `JWT_REFRESH_SECRET=dev-refresh-secret-32chars-min-123456789012`
- `ENCRYPTION_KEY=dev-encryption-key-32bytes-min-123456789012`

**Service URLs (Internal):**
- All services accessible via `http://SERVICE_NAME:INTERNAL_PORT`
- Example: `http://auth:3001`, `http://patient:3004`

**Client URLs (External):**
- `VITE_API_BASE_URL=http://localhost:3301`
- `VITE_AUTH_API_URL=http://localhost:3301`
- Frontend configured to use external ports

---

## COMMON ISSUES & SOLUTIONS

### Issue: Services fail to start with "port already in use"

**Solution:**
```bash
# Check what's using the port
lsof -i :3301

# Kill the process
kill -9 <PID>

# Or use Docker to stop all containers
docker-compose -f docker-compose.dev.yml down
```

### Issue: Bootstrap fails or takes too long

**Solution:**
```bash
# Run clean install
./launch_docker.sh --install

# Then start normally
./launch_docker.sh dev --wait
```

### Issue: Database connections fail

**Solution:**
```bash
# Reset databases
./launch_docker.sh dev --reset-db --wait

# Check database logs
docker-compose -f docker-compose.dev.yml logs postgres
docker-compose -f docker-compose.dev.yml logs mongo
```

### Issue: Services show "not healthy" but appear to be running

**Solution:**
```bash
# Check individual service logs
docker-compose -f docker-compose.dev.yml logs auth
docker-compose -f docker-compose.dev.yml logs scheduling

# Give services more time to start
sleep 30
docker-compose -f docker-compose.dev.yml ps

# Check health endpoint manually
curl http://localhost:3301/api/v1/health -v
```

### Issue: Hot reload not working for services

**Solution:**
```bash
# Restart specific service
docker-compose -f docker-compose.dev.yml restart auth

# Or restart all
docker-compose -f docker-compose.dev.yml restart
```

### Issue: Port conflicts on non-standard configurations

**Solution:**
Edit `.env.docker` to use different ports:
```bash
HOST_AUTH_PORT=3401
HOST_PATIENT_PORT=3404
# etc...
```

---

## VERIFICATION CHECKLIST

Before considering startup complete:

- [ ] All infrastructure services healthy (postgres, redis, mongo, rabbitmq, minio)
- [ ] All application services responding on their health endpoints
- [ ] health-aggregator successfully monitoring all services
- [ ] Web frontend accessible at localhost:5173
- [ ] No errors in Docker logs
- [ ] Can authenticate with test credentials
- [ ] Cross-service communication working (check logs for inter-service calls)

---

## USEFUL DOCKER COMMANDS

```bash
# View all services and status
docker-compose -f docker-compose.dev.yml ps

# View detailed status
docker-compose -f docker-compose.dev.yml ps --format json

# View logs for specific service
docker-compose -f docker-compose.dev.yml logs auth
docker-compose -f docker-compose.dev.yml logs -f auth  # Follow logs

# View logs for all services
docker-compose -f docker-compose.dev.yml logs

# Exec into container
docker-compose -f docker-compose.dev.yml exec auth sh
docker-compose -f docker-compose.dev.yml exec mongo mongosh

# Restart specific service
docker-compose -f docker-compose.dev.yml restart auth

# Remove specific container
docker-compose -f docker-compose.dev.yml down auth

# View resource usage
docker stats

# Clean up unused resources
docker system prune -a
```

---

## MONITORING & OBSERVABILITY

### Health Aggregator Endpoint
```
GET http://localhost:3399/api/v1/health
```

Returns comprehensive health status of all services.

### Service Health Endpoints
```
GET /api/v1/health          - Basic health status
GET /health/detailed         - Detailed health with dependencies
GET /api/v1/health/readiness - Kubernetes-style readiness probe
GET /api/v1/health/liveness  - Kubernetes-style liveness probe
```

### Logs Location
```
# In Docker
docker-compose -f docker-compose.dev.yml logs <service>

# In containers
/workspace/apps/<service-name>/logs/
```

### Metrics (when enabled)
```
Prometheus: http://localhost:9090 (if prometheus container is added)
Jaeger Tracing: http://localhost:6831 (if jaeger container is added)
```

---

## NEXT STEPS

1. **Start Services:**
   ```bash
   cd /home/adrian/Desktop/SBD-Projects/personal/preclinic/dental
   ./launch_docker.sh dev --wait
   ```

2. **Verify All Services Healthy:**
   - Check health-aggregator at `http://localhost:3399/api/v1/health`
   - Or manually test a few services

3. **Access Services:**
   - Web: `http://localhost:5173`
   - API documentation: `http://localhost:3301/api/docs` (if Swagger enabled)
   - MinIO console: `http://localhost:9001`
   - RabbitMQ console: `http://localhost:15672`

4. **Monitor Logs:**
   ```bash
   docker-compose -f docker-compose.dev.yml logs -f
   ```

---

## FILE REFERENCES

- **Docker Compose Dev:** `/home/adrian/Desktop/SBD-Projects/personal/preclinic/dental/docker-compose.dev.yml`
- **Launch Script:** `/home/adrian/Desktop/SBD-Projects/personal/preclinic/dental/launch_docker.sh`
- **Environment Config:** `/home/adrian/Desktop/SBD-Projects/personal/preclinic/dental/.env.docker`
- **Example Env:** `/home/adrian/Desktop/SBD-Projects/personal/preclinic/dental/.env.example`

---

**Report Status:** Ready for Service Startup
**All Systems:** GREEN (Configured correctly, no conflicts, ready to launch)
