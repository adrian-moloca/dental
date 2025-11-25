# DentalOS - Quick Start Guide

**Status:** All microservices ready for startup
**Last Check:** 2025-11-24
**All Ports:** Available (no conflicts)

---

## Start Services (1 Command)

```bash
cd /home/adrian/Desktop/SBD-Projects/personal/preclinic/dental
./launch_docker.sh dev --wait
```

**Done!** Services will start in 5-10 minutes.

---

## Verify Services Are Running

```bash
# Option 1: Run health check script
./scripts/health-check.sh

# Option 2: Check status
docker-compose -f docker-compose.dev.yml ps

# Option 3: Test health endpoints
curl http://localhost:3301/api/v1/health   # auth
curl http://localhost:3399/api/v1/health   # health-aggregator
```

---

## Access Services

| Service | URL | Purpose |
|---------|-----|---------|
| Web Frontend | http://localhost:5173 | Main application |
| Health Check | http://localhost:3399/api/v1/health | All services status |
| MinIO Console | http://localhost:9001 | File storage |
| RabbitMQ Console | http://localhost:15672 | Message queue |

---

## Service Ports

```
Application Services:
  3301  auth
  3302  scheduling
  3303  provider-schedule
  3304  patient
  3305  clinical
  3308  inventory
  3310  billing
  3311  subscription
  3317  enterprise
  3399  health-aggregator

Infrastructure:
  5433  PostgreSQL (auth)
  5434  PostgreSQL (subscription)
  6381  Redis
  27018 MongoDB
  5672  RabbitMQ
  9000  MinIO S3
  9001  MinIO Console
```

---

## Essential Commands

```bash
# Start services
./launch_docker.sh dev --wait

# Check status
./scripts/health-check.sh

# View logs
docker-compose -f docker-compose.dev.yml logs -f

# View specific service logs
docker-compose -f docker-compose.dev.yml logs -f auth

# Stop services
./launch_docker.sh down

# Reset database and restart
./launch_docker.sh dev --reset-db --wait

# Full clean install
./launch_docker.sh --install
./launch_docker.sh dev --wait
```

---

## Startup Timeline

| Time | Event |
|------|-------|
| 0-30s | Docker starts infrastructure services in parallel |
| 30-90s | Infrastructure services become healthy |
| 90-180s | Application services start and become healthy (first run: +3-5 min for bootstrap) |
| 180-210s | Health aggregator starts monitoring all services |
| 210+ | All services ready, frontend accessible at localhost:5173 |

**Total:** 3-5 minutes (subsequent startups: 3-5 minutes, first startup with bootstrap: 5-10 minutes)

---

## Troubleshooting

### Services won't start
```bash
# Check logs
docker-compose -f docker-compose.dev.yml logs

# Reset and restart
./launch_docker.sh dev --reset-db --wait
```

### Port already in use
```bash
# Kill the process using the port
lsof -i :3301 | grep LISTEN | awk '{print $2}' | xargs kill -9

# Or stop all containers
./launch_docker.sh down
```

### Bootstrap fails
```bash
./launch_docker.sh --install
./launch_docker.sh dev --wait
```

### Hot reload not working
```bash
docker-compose -f docker-compose.dev.yml restart auth
```

---

## Documentation

- **Full Health Report:** `MICROSERVICES_HEALTH_REPORT.md`
- **Startup Guide:** `SERVICE_STARTUP_GUIDE.md`
- **Status Details:** `HEALTH_STATUS_REPORT.txt`
- **Docker Commands:** `DOCKER_COMMANDS.md`

---

## Architecture Overview

```
┌─────────────────────────────────────────┐
│  Web Frontend (React/Vite)              │
│  http://localhost:5173                  │
└────────────────┬────────────────────────┘
                 │
         ┌───────┴────────┐
         │                │
    ┌────▼────────┐   ┌──▼────────────────────┐
    │ Auth Service│   │ Health Aggregator     │
    │ (3301)      │   │ Monitors all services │
    └────┬────────┘   │ (3399)                │
         │            └──┬────────────────────┘
         │               │
    ┌────┴─────┬─────────┴──────┬──────────────┐
    │           │                │              │
┌───▼──┐  ┌────▼───┐  ┌────────▼──┐  ┌──────▼──┐
│Sche- │  │Patient │  │ Clinical  │  │ Billing │
│duling│  │Service │  │ Service   │  │ Service │
└──────┘  └────────┘  └───────────┘  └─────────┘

Plus: Inventory, Enterprise, Provider Schedule, Subscription

Infrastructure:
  PostgreSQL × 2
  MongoDB
  Redis
  RabbitMQ
  MinIO
```

---

## Health Status Check

**Current Status:** All systems configured and ready

✓ All 10 application services configured
✓ All 6 infrastructure services configured
✓ All ports available
✓ Docker compose valid
✓ Health checks configured
✓ Launch script functional

---

## Ready to Go!

Run this command to start everything:

```bash
./launch_docker.sh dev --wait
```

Then open your browser to:

```
http://localhost:5173
```

---

**Need help?**
- Check logs: `docker-compose -f docker-compose.dev.yml logs`
- Run health check: `./scripts/health-check.sh`
- Read full docs: `MICROSERVICES_HEALTH_REPORT.md`

---

**Generated:** 2025-11-24
**All Services:** READY FOR DEPLOYMENT
