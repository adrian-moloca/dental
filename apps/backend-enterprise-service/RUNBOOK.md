# Backend Enterprise Service - Operations Runbook

## Service Overview

**Service Name:** backend-enterprise-service
**Purpose:** Multi-clinic and enterprise management microservice
**Port:** 3017
**Namespace:** dentalos
**Team:** Backend Team
**On-Call:** backend-oncall@dentalos.com

### Key Responsibilities
- Organization management
- Clinic management
- Provider-clinic assignments
- RBAC (Role-Based Access Control)

### Dependencies
- **MongoDB:** Primary database (critical)
- **Redis:** Caching and session management (important but not critical)
- **Auth Service:** Authentication and authorization
- **HR Service:** Provider information

---

## Health Check Endpoints

### Liveness Probe
```bash
curl http://localhost:3017/health/liveness
```
**Expected Response:** 200 OK
**Purpose:** Kubernetes uses this to restart unhealthy pods

### Readiness Probe
```bash
curl http://localhost:3017/health/readiness
```
**Expected Response:** 200 OK with dependency status
**Purpose:** Kubernetes uses this to route traffic only to ready pods

### Metrics Endpoint
```bash
curl http://localhost:3017/metrics
```
**Format:** Prometheus exposition format

---

## Common Issues and Resolutions

### 1. High Error Rate (5xx errors > 5%)

**Symptoms:**
- Alert: HighErrorRate firing
- Dashboard shows red error rate line
- Users reporting failures

**Investigation Steps:**

1. Check error logs:
```bash
kubectl logs -n dentalos deployment/backend-enterprise-service --tail=100 | grep ERROR
```

2. Check specific pod errors:
```bash
kubectl logs -n dentalos <pod-name> --tail=500 | grep -A 5 "ERROR"
```

3. Check database connectivity:
```bash
kubectl exec -n dentalos <pod-name> -- curl http://localhost:3017/health/readiness
```

**Common Causes and Fixes:**

| Cause | Symptoms | Resolution |
|-------|----------|------------|
| MongoDB connection lost | "MongoDB is disconnected" in health check | Check MongoDB service status, verify network policies |
| Memory leak | OOMKilled pods, increasing restart count | Restart pods, investigate memory usage patterns |
| External service timeout | Circuit breaker OPEN | Check downstream service health |
| Database query timeout | Slow response times | Check MongoDB slow query log, add indexes |

**Resolution:**
```bash
# Restart pods (rolling restart)
kubectl rollout restart deployment/backend-enterprise-service -n dentalos

# If critical, scale down and up
kubectl scale deployment/backend-enterprise-service --replicas=0 -n dentalos
kubectl scale deployment/backend-enterprise-service --replicas=3 -n dentalos
```

**Escalation:** If errors persist after restart, escalate to database team.

---

### 2. High Latency (p95 > 1s)

**Symptoms:**
- Alert: HighLatency firing
- Users reporting slow responses
- Dashboard shows latency spikes

**Investigation Steps:**

1. Check which endpoints are slow:
```bash
# Query Prometheus
enterprise_service_http_request_duration_seconds{quantile="0.95"}
```

2. Check database query performance:
```bash
# MongoDB slow query log
kubectl exec -n dentalos <mongodb-pod> -- mongo --eval 'db.setProfilingLevel(2, { slowms: 100 })'
```

3. Check event loop lag:
```bash
# Grafana dashboard or Prometheus query
enterprise_service_event_loop_lag_seconds
```

**Common Causes and Fixes:**

| Cause | Fix |
|-------|-----|
| Unindexed database queries | Add indexes to MongoDB collections |
| High CPU usage | Scale up replicas (HPA should do this automatically) |
| Event loop blocking | Identify blocking code, move to worker threads |
| External API slowness | Check circuit breaker metrics, implement caching |

**Resolution:**
```bash
# Scale up immediately
kubectl scale deployment/backend-enterprise-service --replicas=6 -n dentalos

# Check HPA status
kubectl get hpa backend-enterprise-service -n dentalos
```

**Escalation:** If latency is database-related, escalate to database team.

---

### 3. Service Down (All pods unhealthy)

**Symptoms:**
- Alert: ServiceDown firing
- 503 Service Unavailable errors
- No pods in Running state

**Investigation Steps:**

1. Check pod status:
```bash
kubectl get pods -n dentalos -l app=backend-enterprise-service
```

2. Check recent events:
```bash
kubectl get events -n dentalos --sort-by='.lastTimestamp' | grep backend-enterprise-service
```

3. Check pod logs:
```bash
kubectl logs -n dentalos <pod-name> --previous
```

**Common Causes and Fixes:**

| Cause | Symptoms | Fix |
|-------|----------|-----|
| Image pull failure | ImagePullBackOff status | Verify image exists, check registry credentials |
| Configuration error | CrashLoopBackOff status | Review ConfigMap/Secret changes |
| Resource limits | OOMKilled or CPU throttling | Increase resource limits |
| Database unavailable | Pods fail readiness checks | Check MongoDB service |

**Resolution:**
```bash
# Check recent deployment changes
kubectl rollout history deployment/backend-enterprise-service -n dentalos

# Rollback to previous version
kubectl rollout undo deployment/backend-enterprise-service -n dentalos

# Force restart
kubectl delete pods -n dentalos -l app=backend-enterprise-service
```

**Escalation:** Immediate escalation to senior engineer if rollback doesn't work.

---

### 4. High Memory Usage (>90% heap)

**Symptoms:**
- Alert: HighMemoryUsage firing
- OOMKilled pods
- Frequent restarts

**Investigation Steps:**

1. Check memory metrics:
```bash
# Prometheus query
nodejs_heap_size_used_bytes / nodejs_heap_size_total_bytes
```

2. Generate heap snapshot:
```bash
kubectl exec -n dentalos <pod-name> -- node --expose-gc --inspect=0.0.0.0:9229 dist/main.js
```

3. Check for memory leaks in logs:
```bash
kubectl logs -n dentalos <pod-name> | grep -i "heap\|memory"
```

**Resolution:**
```bash
# Temporary: Increase memory limits
kubectl set resources deployment/backend-enterprise-service -n dentalos \
  --limits=memory=2Gi --requests=memory=1Gi

# Restart pods to clear memory
kubectl rollout restart deployment/backend-enterprise-service -n dentalos
```

**Prevention:**
- Review recent code changes for memory leaks
- Enable memory profiling in development
- Consider horizontal scaling instead of vertical

**Escalation:** Provide heap snapshot to development team.

---

### 5. Database Connection Errors

**Symptoms:**
- Alert: DatabaseConnectionErrors firing
- "MongoDB is disconnected" errors
- Readiness probe failing

**Investigation Steps:**

1. Check MongoDB service:
```bash
kubectl get service mongodb -n dentalos
kubectl get pods -n dentalos -l app=mongodb
```

2. Test connectivity from pod:
```bash
kubectl exec -n dentalos <pod-name> -- ping mongodb.dentalos.svc.cluster.local
```

3. Check connection pool:
```bash
# Check metrics
enterprise_service_db_connections_active
```

**Resolution:**
```bash
# Check MongoDB logs
kubectl logs -n dentalos <mongodb-pod> --tail=200

# Verify network policy
kubectl get networkpolicy -n dentalos

# Restart service if needed
kubectl rollout restart deployment/backend-enterprise-service -n dentalos
```

**Escalation:** If MongoDB itself is down, escalate to database team immediately.

---

### 6. High Pod Restart Rate

**Symptoms:**
- Alert: HighPodRestartRate firing
- Pods cycling frequently
- Unstable service

**Investigation Steps:**

1. Check restart count:
```bash
kubectl get pods -n dentalos -l app=backend-enterprise-service \
  -o jsonpath='{range .items[*]}{.metadata.name}{"\t"}{.status.containerStatuses[0].restartCount}{"\n"}{end}'
```

2. Check termination reason:
```bash
kubectl describe pod -n dentalos <pod-name> | grep -A 10 "Last State"
```

3. Review recent deployments:
```bash
kubectl rollout history deployment/backend-enterprise-service -n dentalos
```

**Common Causes:**

| Reason | Fix |
|--------|-----|
| OOMKilled | Increase memory limits |
| Liveness probe failing | Adjust probe thresholds or fix application issue |
| Crash on startup | Check logs for startup errors |
| Config changes | Verify ConfigMap/Secret values |

**Resolution:**
```bash
# Rollback deployment
kubectl rollout undo deployment/backend-enterprise-service -n dentalos

# Adjust probe settings if needed
kubectl edit deployment backend-enterprise-service -n dentalos
```

---

## Deployment Procedures

### Standard Deployment

```bash
# 1. Build and push Docker image
docker build -t backend-enterprise-service:v1.2.3 .
docker push backend-enterprise-service:v1.2.3

# 2. Update deployment
kubectl set image deployment/backend-enterprise-service \
  backend-enterprise-service=backend-enterprise-service:v1.2.3 -n dentalos

# 3. Watch rollout
kubectl rollout status deployment/backend-enterprise-service -n dentalos

# 4. Verify health
kubectl get pods -n dentalos -l app=backend-enterprise-service
curl http://<service-url>/health/readiness
```

### Emergency Rollback

```bash
# Quick rollback to previous version
kubectl rollout undo deployment/backend-enterprise-service -n dentalos

# Rollback to specific revision
kubectl rollout history deployment/backend-enterprise-service -n dentalos
kubectl rollout undo deployment/backend-enterprise-service -n dentalos --to-revision=5
```

### Canary Deployment

```bash
# 1. Deploy canary (10% traffic)
kubectl apply -f k8s/canary-deployment.yaml

# 2. Monitor metrics for 10 minutes
# Check error rates, latency, and business metrics

# 3. If successful, promote to 100%
kubectl apply -f k8s/deployment.yaml

# 4. Remove canary
kubectl delete -f k8s/canary-deployment.yaml
```

---

## Scaling Procedures

### Manual Scaling

```bash
# Scale up
kubectl scale deployment/backend-enterprise-service --replicas=6 -n dentalos

# Scale down
kubectl scale deployment/backend-enterprise-service --replicas=2 -n dentalos
```

### Horizontal Pod Autoscaler (HPA)

```bash
# Check HPA status
kubectl get hpa backend-enterprise-service -n dentalos

# Adjust HPA
kubectl edit hpa backend-enterprise-service -n dentalos

# Disable HPA temporarily
kubectl delete hpa backend-enterprise-service -n dentalos
```

---

## Maintenance Tasks

### Log Rotation

```bash
# Logs are automatically rotated by Kubernetes
# To view logs from previous container:
kubectl logs -n dentalos <pod-name> --previous
```

### Database Migrations

```bash
# Run migrations manually
kubectl exec -n dentalos <pod-name> -- npm run migrate

# Rollback migration
kubectl exec -n dentalos <pod-name> -- npm run migrate:rollback
```

### Clear Cache

```bash
# Clear Redis cache
kubectl exec -n dentalos redis-master-0 -- redis-cli FLUSHDB
```

---

## Monitoring and Alerting

### Key Dashboards
- **Grafana:** https://grafana.dentalos.com/d/backend-enterprise-service
- **Prometheus:** https://prometheus.dentalos.com

### Key Metrics to Watch
- **Error Rate:** < 1%
- **P95 Latency:** < 500ms
- **P99 Latency:** < 1s
- **Memory Usage:** < 80%
- **CPU Usage:** < 70%
- **Event Loop Lag:** < 100ms

### Alert Severity Levels

| Level | Response Time | Examples |
|-------|---------------|----------|
| Critical | Immediate | Service down, high error rate, database unavailable |
| Warning | 30 minutes | High latency, high memory usage, slow queries |
| Info | Next business day | Low replica count, approaching limits |

---

## Troubleshooting Commands

### Quick Diagnostics

```bash
# Service status
kubectl get all -n dentalos -l app=backend-enterprise-service

# Recent events
kubectl get events -n dentalos --field-selector involvedObject.name=backend-enterprise-service

# Pod resource usage
kubectl top pods -n dentalos -l app=backend-enterprise-service

# Describe deployment
kubectl describe deployment backend-enterprise-service -n dentalos

# Get logs from all pods
kubectl logs -n dentalos -l app=backend-enterprise-service --tail=50

# Execute command in pod
kubectl exec -it -n dentalos <pod-name> -- /bin/sh

# Port forward for local debugging
kubectl port-forward -n dentalos <pod-name> 3017:3017
```

### Network Debugging

```bash
# Test internal connectivity
kubectl run -it --rm debug --image=busybox --restart=Never -- /bin/sh
# Then inside pod:
wget -O- http://backend-enterprise-service.dentalos.svc.cluster.local:3017/health/liveness

# Check DNS resolution
kubectl exec -n dentalos <pod-name> -- nslookup mongodb.dentalos.svc.cluster.local

# Check network policies
kubectl get networkpolicy -n dentalos
kubectl describe networkpolicy -n dentalos
```

---

## Contacts and Escalation

### On-Call Rotation
- **Primary:** backend-oncall@dentalos.com
- **Escalation:** senior-backend-oncall@dentalos.com
- **Manager:** backend-manager@dentalos.com

### Specialized Teams
- **Database Team:** dba@dentalos.com (for MongoDB/Redis issues)
- **Platform Team:** platform@dentalos.com (for Kubernetes/infrastructure)
- **Security Team:** security@dentalos.com (for security incidents)

### Escalation Path
1. **Level 1:** On-call engineer (0-30 min)
2. **Level 2:** Senior engineer (30-60 min)
3. **Level 3:** Engineering manager (60+ min)
4. **Level 4:** CTO (critical incidents only)

---

## Additional Resources

- **Architecture Diagram:** https://wiki.dentalos.com/architecture/enterprise-service
- **API Documentation:** http://localhost:3017/api-docs
- **Source Code:** https://github.com/dentalos/backend-enterprise-service
- **CI/CD Pipeline:** https://github.com/dentalos/backend-enterprise-service/actions
- **Incident History:** https://status.dentalos.com

---

## Change Log

| Date | Change | Author |
|------|--------|--------|
| 2025-11-24 | Initial runbook creation | DevOps Team |
| - | - | - |
