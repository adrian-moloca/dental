# Quick Start: Local Infrastructure

## Services Added

### MinIO (S3-Compatible Storage)
- **Console UI**: http://localhost:9001
- **API**: http://localhost:9000
- **Login**: minioadmin / minioadmin
- **Buckets**: dentalos-local, dentalos-documents, dentalos-images, dentalos-backups

### MailHog (Email Testing)
- **Web UI**: http://localhost:8025
- **SMTP**: localhost:1025
- **No authentication required**

## Quick Commands

```bash
# Start infrastructure only
docker-compose up -d postgres-auth postgres-subscription mongodb redis rabbitmq minio mailhog

# Start everything
docker-compose up -d

# Check status
docker-compose ps

# View logs
docker-compose logs -f minio
docker-compose logs minio-init
docker-compose logs -f mailhog

# Stop all
docker-compose down

# Remove all data (CAUTION!)
docker-compose down -v
```

## Test Endpoints

```bash
# MinIO health
curl http://localhost:9000/minio/health/live

# MailHog web UI
curl -I http://localhost:8025

# Check bucket creation
docker-compose logs minio-init
```

## Integration

### Using MinIO in Your Service
```env
STORAGE_ENDPOINT=http://minio:9000
STORAGE_ACCESS_KEY_ID=minioadmin
STORAGE_SECRET_ACCESS_KEY=minioadmin
STORAGE_BUCKET=dentalos-documents
STORAGE_REGION=us-east-1
STORAGE_FORCE_PATH_STYLE=true
```

### Using MailHog for Email
```env
SMTP_HOST=mailhog
SMTP_PORT=1025
SMTP_SECURE=false
SMTP_AUTH_USER=
SMTP_AUTH_PASS=
```

## Files Modified/Created

**Modified:**
- `/home/adrian/Desktop/SBD-Projects/personal/preclinic/dental/docker-compose.yml`
- `/home/adrian/Desktop/SBD-Projects/personal/preclinic/dental/test-health-all.sh`

**Created:**
- `/home/adrian/Desktop/SBD-Projects/personal/preclinic/dental/infra/docker/init-scripts/minio-init.sh`
- `/home/adrian/Desktop/SBD-Projects/personal/preclinic/dental/infra/docker/LOCAL-INFRASTRUCTURE.md`
- `/home/adrian/Desktop/SBD-Projects/personal/preclinic/dental/INFRASTRUCTURE-CHANGES.md`
- `/home/adrian/Desktop/SBD-Projects/personal/preclinic/dental/QUICK-START-LOCAL-INFRA.md`

## Documentation

For detailed documentation, see:
- **Full Guide**: `infra/docker/LOCAL-INFRASTRUCTURE.md`
- **Change Summary**: `INFRASTRUCTURE-CHANGES.md`
