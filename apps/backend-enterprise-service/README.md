# Backend Enterprise Service

DentalOS Multi-Clinic & Enterprise Management Microservice - Production-Ready with Complete Reliability Standards

[![Production Ready](https://img.shields.io/badge/status-production%20ready-brightgreen)]()
[![Reliability](https://img.shields.io/badge/reliability-99.9%25-blue)]()
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue)]()
[![NestJS](https://img.shields.io/badge/NestJS-10.3-red)]()
[![Node.js](https://img.shields.io/badge/Node.js-20-green)]()

## Overview

The backend-enterprise-service is a production-ready microservice for managing multi-clinic dental organizations. It provides comprehensive features for organization management, clinic administration, provider assignments, and role-based access control (RBAC).

**Port:** 3017
**Namespace:** dentalos
**Version:** 1.0.0

### Key Features

- **Organizations:** Multi-tenant organization management with subscription tiers
- **Clinics:** Multi-location clinic management and configuration
- **Provider Assignments:** Staff assignment to clinics with roles and schedules
- **RBAC:** Enterprise and clinic-level role-based access control

## Quick Start

### Prerequisites

- Node.js 20+
- pnpm 8+
- MongoDB 8+
- Redis 7+

### Installation

```bash
# Install dependencies
pnpm install

# Copy environment variables
cp .env.example .env

# Edit .env with your configuration
```

### Development

```bash
# Start in development mode
pnpm start:dev

# Start with watch mode
pnpm start:watch

# Run tests
pnpm test

# Run with PM2 cluster mode
pm2 start ecosystem.config.js --env development
```

### Production

```bash
# Build application
pnpm build

# Start in production mode
pnpm start:prod

# Or use PM2 for cluster mode
pm2 start ecosystem.config.js --env production
```

### Docker

```bash
# Build image
docker build -t backend-enterprise-service:latest .

# Run container
docker run -p 3017:3017 \
  -e MONGODB_URI=mongodb://... \
  -e REDIS_HOST=redis \
  backend-enterprise-service:latest
```

### Kubernetes

```bash
# Create namespace
kubectl create namespace dentalos

# Create secrets
kubectl create secret generic backend-enterprise-service-secrets \
  --from-literal=MONGODB_URI='mongodb://...' \
  --from-literal=REDIS_PASSWORD='...' \
  --namespace=dentalos

# Deploy
kubectl apply -f k8s/ --namespace=dentalos

# Check status
kubectl get pods -n dentalos -l app=backend-enterprise-service
```

## API Documentation

Once running, access the interactive API documentation:

- **Local:** http://localhost:3017/api-docs
- **Staging:** https://api-staging.dentalos.com/api-docs
- **Production:** https://api.dentalos.com/api-docs

## Health Checks

```bash
# Liveness probe (process alive)
curl http://localhost:3017/health/liveness

# Readiness probe (dependencies healthy)
curl http://localhost:3017/health/readiness

# Prometheus metrics
curl http://localhost:3017/metrics
```

## Documentation

### Quick Reference

- **[Implementation Summary](IMPLEMENTATION_SUMMARY.md)** - Complete implementation overview
- **[Operations Runbook](RUNBOOK.md)** - Troubleshooting and operations guide
- **[Reliability Guide](RELIABILITY.md)** - Detailed reliability documentation

### Key Topics

#### Reliability & Resilience
- [Service Resilience](RELIABILITY.md#service-resilience) - Graceful shutdown, health checks, cluster mode
- [Error Recovery](RELIABILITY.md#error-recovery) - Retry mechanisms, circuit breakers, fallbacks
- [Resource Management](RELIABILITY.md#resource-management) - Memory limits, CPU throttling, connection pooling

#### Monitoring & Observability
- [Prometheus Metrics](RELIABILITY.md#monitoring--observability) - Complete metrics reference
- [Grafana Dashboard](monitoring/grafana-dashboard.json) - Import ready dashboard
- [Prometheus Alerts](monitoring/prometheus-alerts.yaml) - Production alert rules

#### Operations
- [Common Issues](RUNBOOK.md#common-issues-and-resolutions) - Solutions to frequent problems
- [Deployment Procedures](RUNBOOK.md#deployment-procedures) - Standard and emergency deployments
- [Troubleshooting Commands](RUNBOOK.md#troubleshooting-commands) - Quick diagnostic commands

## Architecture

### Technology Stack

**Backend:**
- NestJS 10.3 (Node.js framework)
- TypeScript 5.3
- MongoDB 8.1 (database)
- Redis 5.3 (caching)
- Mongoose 8.1 (ODM)

**Reliability:**
- Prometheus metrics (prom-client)
- Circuit breaker pattern
- Exponential backoff retry
- Connection pooling
- Graceful shutdown

**Infrastructure:**
- Docker (containerization)
- Kubernetes (orchestration)
- PM2 (process management)
- Grafana (visualization)
- Prometheus (monitoring)

### Project Structure

```
backend-enterprise-service/
├── src/
│   ├── main.ts                    # Application entry point
│   ├── app.module.ts              # Root module
│   ├── config/                    # Configuration
│   ├── health/                    # Health check endpoints
│   ├── metrics/                   # Prometheus metrics
│   │   ├── metrics.service.ts
│   │   ├── metrics.controller.ts
│   │   ├── metrics.interceptor.ts
│   │   └── metrics.module.ts
│   ├── common/
│   │   └── resilience/           # Resilience patterns
│   │       ├── circuit-breaker.ts
│   │       └── retry.decorator.ts
│   ├── modules/
│   │   ├── organizations/        # Organization management
│   │   ├── clinics/              # Clinic management
│   │   ├── assignments/          # Provider assignments
│   │   └── rbac/                 # Access control
│   ├── schemas/                  # MongoDB schemas
│   ├── filters/                  # Exception filters
│   └── interceptors/             # Request/response interceptors
├── k8s/                          # Kubernetes manifests
│   ├── deployment.yaml
│   ├── service.yaml
│   ├── hpa.yaml
│   ├── pdb.yaml
│   ├── configmap.yaml
│   └── serviceaccount.yaml
├── monitoring/                   # Monitoring configuration
│   ├── grafana-dashboard.json
│   ├── prometheus-alerts.yaml
│   └── prometheus-servicemonitor.yaml
├── Dockerfile                    # Optimized multi-stage build
├── ecosystem.config.js           # PM2 configuration
├── RUNBOOK.md                    # Operations guide
├── RELIABILITY.md                # Reliability documentation
└── IMPLEMENTATION_SUMMARY.md     # Implementation overview
```

## Reliability Features

### Service Resilience ✅

- **Graceful Shutdown:** Handles SIGTERM/SIGINT, waits for in-flight requests, closes connections
- **Health Checks:** Liveness and readiness probes with dependency checking
- **Cluster Mode:** PM2 cluster support with auto-restart and load balancing
- **Zero-Downtime Deployments:** Rolling updates with preStop hooks

### Error Recovery ✅

- **Retry Mechanism:** Exponential backoff with jitter, configurable attempts
- **Circuit Breaker:** Three-state pattern (CLOSED, OPEN, HALF_OPEN) with fallback support
- **Dead Letter Queues:** Error event tracking and processing
- **Fallback Strategies:** Graceful degradation when dependencies fail

### Resource Management ✅

- **Memory Limits:** Kubernetes limits (1Gi), Node.js limits (512MB heap)
- **CPU Throttling:** Kubernetes limits (1 core max)
- **Connection Pooling:** MongoDB (10 max, 2 min), Redis with retry strategy
- **Garbage Collection:** Automatic monitoring and tuning

### Monitoring & Observability ✅

- **Prometheus Metrics:** HTTP, database, business, and system metrics
- **Grafana Dashboard:** 12 comprehensive panels for all key metrics
- **Custom Metrics:** Business KPIs (organizations, clinics, assignments)
- **Latency Tracking:** p50, p95, p99, p99.9 percentiles
- **Error Tracking:** Error rate by type, route, and status code

### Container Optimization ✅

- **Multi-Stage Build:** Separate builder and production stages
- **Layer Caching:** Optimized for faster builds
- **Alpine Base:** Small image size (~200MB)
- **Security:** Non-root user, read-only filesystem
- **Health Probes:** Built-in Docker healthcheck

## Monitoring

### Metrics Endpoint

```bash
curl http://localhost:3017/metrics
```

### Key Metrics

**HTTP Metrics (RED):**
- `enterprise_service_http_requests_total` - Request count
- `enterprise_service_http_request_duration_seconds` - Latency histogram
- `enterprise_service_http_requests_in_flight` - Active requests

**Database Metrics:**
- `enterprise_service_db_operations_total` - DB operations
- `enterprise_service_db_operation_duration_seconds` - Query latency
- `enterprise_service_db_connections_active` - Connection pool

**Business Metrics:**
- `enterprise_service_organizations_total` - Total organizations
- `enterprise_service_clinics_total` - Total clinics
- `enterprise_service_assignments_total` - Total assignments

**System Metrics:**
- `process_cpu_seconds_total` - CPU usage
- `nodejs_heap_size_used_bytes` - Memory usage
- `enterprise_service_event_loop_lag_seconds` - Event loop lag

### Dashboards

Import the Grafana dashboard:
```bash
# File: monitoring/grafana-dashboard.json
# In Grafana: Dashboards → Import → Upload JSON
```

### Alerts

Apply Prometheus alert rules:
```bash
kubectl apply -f monitoring/prometheus-alerts.yaml
```

**Critical Alerts:**
- HighErrorRate (>5%)
- ServiceDown
- DatabaseConnectionErrors
- LowReplicaCount

**Warning Alerts:**
- HighLatency (p95 >1s)
- HighMemoryUsage (>90%)
- HighEventLoopLag (>100ms)

## Performance

### SLO Targets

- **Availability:** 99.9% (3 nines)
- **Error Rate:** < 1%
- **P95 Latency:** < 500ms
- **P99 Latency:** < 1s
- **Throughput:** 500 req/s sustained

### Resource Usage

- **Memory:** 400-600MB average
- **CPU:** 20-40% average
- **Startup Time:** < 3s cold start
- **Event Loop Lag:** < 50ms

### Scalability

- **Horizontal:** 3-10 replicas (HPA)
- **Vertical:** 512Mi-1Gi memory, 0.25-1 CPU cores
- **Database:** Connection pooling, read replicas
- **Caching:** Redis for session and data caching

## Testing

### Unit Tests

```bash
pnpm test
```

### Integration Tests

```bash
pnpm test:integration
```

### Load Tests

```bash
# Using k6
k6 run load-test.js

# Using Artillery
artillery run artillery-config.yml
```

### Chaos Tests

```bash
# Pod deletion
kubectl delete pod -n dentalos <pod-name>

# Network latency (Chaos Mesh)
kubectl apply -f chaos/network-latency.yaml
```

## Deployment

### Kubernetes Deployment

```bash
# Deploy all resources
kubectl apply -f k8s/

# Watch rollout
kubectl rollout status deployment/backend-enterprise-service -n dentalos

# Rollback if needed
kubectl rollout undo deployment/backend-enterprise-service -n dentalos
```

### PM2 Deployment

```bash
# Start
pm2 start ecosystem.config.js --env production

# Reload (zero-downtime)
pm2 reload backend-enterprise-service

# Monitor
pm2 monit
```

## Troubleshooting

### Quick Diagnostics

```bash
# Check pod status
kubectl get pods -n dentalos -l app=backend-enterprise-service

# View logs
kubectl logs -n dentalos <pod-name> --tail=100

# Check health
curl http://localhost:3017/health/readiness

# View metrics
curl http://localhost:3017/metrics
```

### Common Issues

See [RUNBOOK.md](RUNBOOK.md) for detailed troubleshooting:

- [High Error Rate](RUNBOOK.md#1-high-error-rate-5xx-errors--5)
- [High Latency](RUNBOOK.md#2-high-latency-p95--1s)
- [Service Down](RUNBOOK.md#3-service-down-all-pods-unhealthy)
- [High Memory Usage](RUNBOOK.md#4-high-memory-usage-90-heap)
- [Database Errors](RUNBOOK.md#5-database-connection-errors)

## Security

### Best Practices Implemented

- ✅ Non-root container user (UID 1001)
- ✅ Read-only root filesystem
- ✅ No privilege escalation
- ✅ Dropped all capabilities
- ✅ Security context constraints
- ✅ Network policies
- ✅ RBAC with least privilege
- ✅ Secrets management (not in repo)

### Environment Variables

**Required:**
- `MONGODB_URI` - MongoDB connection string (secret)
- `REDIS_PASSWORD` - Redis password (secret)

**Optional:**
- `PORT` - Service port (default: 3017)
- `NODE_ENV` - Environment (development/production)
- `LOG_LEVEL` - Logging level (default: info)

See `.env.example` for complete list.

## Contributing

### Development Setup

```bash
# Install dependencies
pnpm install

# Run linter
pnpm lint

# Format code
pnpm format

# Type check
pnpm typecheck

# Run tests
pnpm test
```

### Code Quality

- ESLint for linting
- Prettier for formatting
- TypeScript strict mode
- Vitest for testing
- 80%+ code coverage target

## Support

### Documentation

- **[Runbook](RUNBOOK.md)** - Operations and troubleshooting
- **[Reliability](RELIABILITY.md)** - Reliability patterns and best practices
- **[Summary](IMPLEMENTATION_SUMMARY.md)** - Implementation overview

### Contacts

- **On-Call:** backend-oncall@dentalos.com
- **Manager:** backend-manager@dentalos.com
- **Platform Team:** platform@dentalos.com

### Resources

- **API Docs:** http://localhost:3017/api-docs
- **Grafana:** https://grafana.dentalos.com
- **Prometheus:** https://prometheus.dentalos.com
- **Wiki:** https://wiki.dentalos.com

## License

Proprietary - DentalOS © 2025

---

## Status

**Production Ready ✅**

All reliability and restart standards have been fully implemented:

- ✅ Service Resilience
- ✅ Error Recovery
- ✅ Resource Management
- ✅ Monitoring & Observability
- ✅ Restart Optimization
- ✅ Container Optimization
- ✅ Zero-Downtime Deployments
- ✅ Operations Documentation

**Implementation Date:** 2025-11-24
**Version:** 1.0.0
