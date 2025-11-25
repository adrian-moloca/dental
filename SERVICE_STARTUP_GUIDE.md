# DentalOS Service Startup & Verification Guide

## Current System Status: All Services DOWN (Ready to Start)

---

## 1. QUICK START

### Start all services in development mode:

```bash
cd /home/adrian/Desktop/SBD-Projects/personal/preclinic/dental
./launch_docker.sh dev --wait
```

**Expected behavior:**
- Docker starts compiling/bootstrapping (1-2 minutes first time)
- Infrastructure services start first (postgres, redis, mongo, rabbitmq, minio)
- Application services start in parallel once dependencies are ready
- Health checks verify each service is ready
- Log output shows service startup and activity

**Estimated time:** 5-10 minutes total

---

## 2. VERIFY ALL SERVICES ARE HEALTHY

### Option A: Run the health check script
```bash
./scripts/health-check.sh
```

### Option B: Manual verification
```bash
# Test individual service health endpoints
curl http://localhost:3301/api/v1/health   # auth
curl http://localhost:3302/api/v1/health   # scheduling
curl http://localhost:3304/api/v1/health   # patient
curl http://localhost:3305/api/v1/health   # clinical
curl http://localhost:3399/api/v1/health   # health-aggregator

# Expected response:
# HTTP 200 with JSON health status
```

### Option C: Docker compose status
```bash
docker-compose -f docker-compose.dev.yml ps
```

**Expected output:**
```
NAME                        STATUS              PORTS
dentalos-auth              running             0.0.0.0:3301->3001/tcp
dentalos-postgres-auth     healthy             0.0.0.0:5433->5432/tcp
dentalos-redis             healthy             0.0.0.0:6381->6379/tcp
dentalos-mongo             healthy             0.0.0.0:27018->27017/tcp
dentalos-rabbitmq          healthy             0.0.0.0:5672->5672/tcp, 0.0.0.0:15672->15672/tcp
dentalos-minio             healthy             0.0.0.0:9000->9000/tcp, 0.0.0.0:9001->9001/tcp
... (and 4 more services)
```

---

## 3. SERVICE PORT MAPPING VERIFICATION

All services should be accessible on their external ports:

```bash
# Application Services
3301  -> auth
3302  -> scheduling
3303  -> provider-schedule
3304  -> patient
3305  -> clinical
3308  -> inventory
3310  -> billing
3311  -> subscription
3317  -> enterprise
3399  -> health-aggregator
5173  -> web frontend

# Infrastructure Services
5433  -> PostgreSQL (auth)
5434  -> PostgreSQL (subscription)
6381  -> Redis
27018 -> MongoDB
5672  -> RabbitMQ
15672 -> RabbitMQ Management UI
9000  -> MinIO S3 API
9001  -> MinIO Web Console
```

**Verify ports are open:**
```bash
netstat -tuln | grep LISTEN | grep -E ':(3301|3302|3303|3304|3305|3308|3310|3311|3317|3399)'
```

---

## 4. SERVICE DEPENDENCY VERIFICATION

Services have critical dependencies. Verify they are met:

### Auth Service Dependencies
- PostgreSQL (5433) - MUST be healthy
- Redis (6381) - MUST be healthy
- RabbitMQ (5672) - MUST be healthy

```bash
curl http://localhost:3301/api/v1/health/detailed
```

### MongoDB Services (scheduling, patient, clinical, inventory, billing, enterprise)
- MongoDB (27018) - MUST be healthy

```bash
curl http://localhost:3302/api/v1/health/detailed  # scheduling
curl http://localhost:3304/api/v1/health/detailed  # patient
```

### Subscription Service Dependencies
- PostgreSQL Subscription (5434) - MUST be healthy
- Redis (6381) - MUST be healthy

```bash
curl http://localhost:3311/api/v1/health/detailed
```

---

## 5. HEALTH AGGREGATOR VERIFICATION

The health-aggregator monitors all services and provides a single health endpoint:

```bash
curl http://localhost:3399/api/v1/health -s | jq .
```

**Expected response includes:**
- Status of all application services
- Dependency health
- Overall system health

---

## 6. ACCESS SERVICES

### Web Frontend
```
http://localhost:5173
```

### API Documentation (if Swagger enabled)
```
http://localhost:3301/api/docs        # Auth API
http://localhost:3302/api/docs        # Scheduling API
```

### Database Consoles
```
MinIO Console:     http://localhost:9001 (minioadmin/minioadmin)
RabbitMQ Console:  http://localhost:15672 (dev/dev)
```

---

## 7. MONITORING & LOGS

### View all service logs
```bash
docker-compose -f docker-compose.dev.yml logs -f
```

### View logs for specific service
```bash
docker-compose -f docker-compose.dev.yml logs -f auth
docker-compose -f docker-compose.dev.yml logs -f scheduling
docker-compose -f docker-compose.dev.yml logs -f postgres
```

### Real-time stats
```bash
docker stats
```

---

## 8. TROUBLESHOOTING

### Service won't start

**Check service logs:**
```bash
docker-compose -f docker-compose.dev.yml logs auth
```

**Check dependencies:**
```bash
docker-compose -f docker-compose.dev.yml ps postgres redis rabbitmq
```

**If dependencies are down:**
```bash
./launch_docker.sh down
./launch_docker.sh dev --reset-db --wait
```

### Port already in use

```bash
# Find what's using the port
lsof -i :3301

# Kill the process
kill -9 <PID>

# Or stop all containers
./launch_docker.sh down
```

### Services timeout on startup

**Increase wait time and check health:**
```bash
# Wait 30 more seconds
sleep 30
./scripts/health-check.sh
```

### Database connection errors

```bash
# Reset databases
./launch_docker.sh dev --reset-db --wait

# Verify PostgreSQL is running
docker-compose -f docker-compose.dev.yml logs postgres

# Verify MongoDB is running
docker-compose -f docker-compose.dev.yml logs mongo
```

### Hot reload not working

```bash
# Restart the service
docker-compose -f docker-compose.dev.yml restart auth

# Or restart all
docker-compose -f docker-compose.dev.yml restart
```

---

## 9. COMMON WORKFLOWS

### Development with hot reload
```bash
# Terminal 1: Start services
./launch_docker.sh dev --wait

# Terminal 2: Watch logs
docker-compose -f docker-compose.dev.yml logs -f auth

# Terminal 3: Make code changes
# Changes automatically reload due to nodemon
```

### Fresh database for testing
```bash
./launch_docker.sh dev --reset-db --seed --wait
```

### Test production build locally
```bash
./launch_docker.sh docker --wait
```

### Clean everything and restart
```bash
./launch_docker.sh down
./launch_docker.sh --install
./launch_docker.sh dev --wait
```

### Stop services without removing volumes
```bash
./launch_docker.sh down
```

### Full cleanup (remove all data)
```bash
./launch_docker.sh down
docker volume rm $(docker volume ls -q -f name=dentalos)
./launch_docker.sh dev --wait
```

---

## 10. HEALTH CHECK INTERPRETATION

### Status Codes

**Healthy (Green)**
- Service is running and responding to health checks
- All dependencies are satisfied
- Ready to handle traffic

**Running but Unhealthy (Yellow)**
- Service is running but health check failed
- May indicate startup phase (give it more time)
- Check logs for specific errors

**Not Running (Red)**
- Service is stopped or failed
- Port is not open
- Check that dependencies are running first
- Review startup logs

---

## 11. SERVICE STARTUP SEQUENCE

Services start in this order due to dependency constraints:

1. **Infrastructure (Parallel)** - 0-60 seconds
   - PostgreSQL (auth)
   - PostgreSQL (subscription)
   - Redis
   - MongoDB
   - RabbitMQ
   - MinIO

2. **Bootstrap (if needed)** - 3-5 minutes (first run only)
   - Install dependencies
   - Build shared packages

3. **Core Services (Parallel)** - 60-120 seconds
   - Auth (after postgres, redis, rabbitmq ready)
   - Scheduling (after mongo, redis ready)
   - Patient (after mongo, redis ready)
   - Clinical (after mongo, redis ready)
   - Inventory (after mongo, redis, minio ready)
   - Billing (after mongo, redis ready)
   - Subscription (after postgres-subscription, redis ready)
   - Provider Schedule (after mongo ready)
   - Enterprise (after mongo, redis ready)

4. **Health Aggregator** - 120-150 seconds
   - Monitors all services

5. **Frontend** - 150+ seconds
   - Vite dev server

---

## 12. KEY FILES

| File | Purpose |
|------|---------|
| `docker-compose.dev.yml` | Development environment configuration |
| `launch_docker.sh` | Main startup script |
| `.env.docker` | Environment variables |
| `scripts/health-check.sh` | Health monitoring script |
| `MICROSERVICES_HEALTH_REPORT.md` | Detailed system documentation |

---

## 13. QUICK REFERENCE COMMANDS

```bash
# Startup
./launch_docker.sh dev --wait

# Health check
./scripts/health-check.sh

# View status
docker-compose -f docker-compose.dev.yml ps

# View logs
docker-compose -f docker-compose.dev.yml logs -f

# Stop services
./launch_docker.sh down

# Reset and restart
./launch_docker.sh dev --reset-db --wait

# Test service health
curl http://localhost:3301/api/v1/health
curl http://localhost:3399/api/v1/health  # aggregator

# Access web frontend
# Open browser to http://localhost:5173
```

---

## 14. HEALTH CHECK SUMMARY

Based on the current system analysis:

**Status:** All services configured and ready to start

**Port Availability:** All required ports are available (no conflicts)

**Docker Compose:** Configuration is valid and complete

**Launch Script:** Functional and ready to start services

**Next Step:** Run `./launch_docker.sh dev --wait`

---

## Expected Timeline

| Phase | Duration | What's Happening |
|-------|----------|-----------------|
| Preparation | <1 min | Docker validates config, pulls images |
| Infrastructure startup | 1-2 min | PostgreSQL, Redis, MongoDB, RabbitMQ starting |
| Infrastructure health checks | 1-2 min | Services initializing and passing health checks |
| Bootstrap (first run only) | 3-5 min | Installing dependencies, building shared packages |
| Application services startup | 2-3 min | All 10 services starting with dependencies |
| Service health checks | 1-2 min | All services verifying they're healthy |
| **Total** | **5-10 min** | All systems ready |

---

## Monitoring Dashboard

Create a monitoring setup for continuous health verification:

```bash
# Terminal 1: Start services
./launch_docker.sh dev --wait

# Terminal 2: Monitor health every 30 seconds
watch -n 30 './scripts/health-check.sh'

# Terminal 3: Watch logs
docker-compose -f docker-compose.dev.yml logs -f --tail=50
```

---

## Support

For issues:
1. Check `MICROSERVICES_HEALTH_REPORT.md` for detailed information
2. Run `./scripts/health-check.sh` to identify problems
3. Review logs: `docker-compose -f docker-compose.dev.yml logs <service>`
4. Check Docker daemon: `docker ps`
5. Verify network: `docker network ls`

---

**Last Updated:** 2025-11-24
**Report Type:** Service Startup & Verification Guide
**Status:** Ready to Deploy
