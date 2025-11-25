# Local Infrastructure Services

This document describes the local infrastructure services added to the Dental OS project for 100% local development without external dependencies.

## Overview

The following services have been added to `docker-compose.yml` for local development:

1. **MinIO** - S3-compatible object storage
2. **MailHog** - Email testing service

## MinIO (Object Storage)

MinIO provides S3-compatible object storage for local development, eliminating the need for AWS S3.

### Configuration

- **Container Name**: `dentalos-minio`
- **API Port**: `9000` (configurable via `HOST_MINIO_API_PORT`)
- **Console Port**: `9001` (configurable via `HOST_MINIO_CONSOLE_PORT`)
- **Default Credentials**:
  - Username: `minioadmin` (configurable via `MINIO_ROOT_USER`)
  - Password: `minioadmin` (configurable via `MINIO_ROOT_PASSWORD`)

### Pre-configured Buckets

The MinIO initialization container (`minio-init`) automatically creates the following buckets on startup:

1. **dentalos-local** - General purpose storage
2. **dentalos-documents** - Document storage
3. **dentalos-images** - Image storage (publicly accessible for downloads)
4. **dentalos-backups** - Backup storage

### Access

- **Web Console**: http://localhost:9001
  - Login with credentials: `minioadmin` / `minioadmin`
  - Browse buckets, upload files, manage policies

- **API Endpoint**: http://localhost:9000
  - Use AWS SDK compatible clients
  - S3 API compatible

### Example Configuration for Services

```env
STORAGE_ENDPOINT=http://minio:9000
STORAGE_ACCESS_KEY_ID=minioadmin
STORAGE_SECRET_ACCESS_KEY=minioadmin
STORAGE_BUCKET=dentalos-local
STORAGE_REGION=us-east-1
STORAGE_FORCE_PATH_STYLE=true
```

### Health Check

MinIO includes a built-in health check endpoint:
```bash
curl http://localhost:9000/minio/health/live
```

## MailHog (Email Testing)

MailHog captures all outgoing emails for testing without actually sending them.

### Configuration

- **Container Name**: `dentalos-mailhog`
- **SMTP Port**: `1025` (configurable via `HOST_MAILHOG_SMTP_PORT`)
- **Web UI Port**: `8025` (configurable via `HOST_MAILHOG_UI_PORT`)
- **Authentication**: None required

### Access

- **Web UI**: http://localhost:8025
  - View all captured emails
  - Search and filter emails
  - View email content (HTML, text, source)
  - Test email rendering

- **SMTP Server**: `localhost:1025`
  - Configure your application to send emails to this endpoint

### Example Configuration for Services

```env
SMTP_HOST=mailhog
SMTP_PORT=1025
SMTP_SECURE=false
SMTP_AUTH_USER=
SMTP_AUTH_PASS=
```

### Testing Emails

1. Configure your service to use MailHog's SMTP endpoint
2. Trigger an email in your application
3. Open http://localhost:8025 to view the captured email
4. Verify email content, formatting, and attachments

### Health Check

MailHog's web interface can be used for health checks:
```bash
curl http://localhost:8025
```

## Starting Services

### Start All Services
```bash
docker-compose up -d
```

### Start Only Infrastructure Services
```bash
docker-compose up -d postgres-auth postgres-subscription mongodb redis rabbitmq minio mailhog
```

### View Logs
```bash
# MinIO logs
docker-compose logs -f minio

# MinIO initialization logs
docker-compose logs minio-init

# MailHog logs
docker-compose logs -f mailhog
```

### Stop Services
```bash
docker-compose down
```

### Reset All Data
```bash
docker-compose down -v
```

## Verification

Run the health check script to verify all services are running:

```bash
./test-health-all.sh
```

The script will now check for local infrastructure services including MinIO and MailHog.

## Volume Management

### Persistent Storage

MinIO data is persisted in a Docker volume:
- **Volume Name**: `dentalos-minio-data`
- **Location**: Docker managed volume

### Backup MinIO Data
```bash
docker run --rm -v dentalos-minio-data:/data -v $(pwd):/backup alpine tar czf /backup/minio-backup.tar.gz /data
```

### Restore MinIO Data
```bash
docker run --rm -v dentalos-minio-data:/data -v $(pwd):/backup alpine tar xzf /backup/minio-backup.tar.gz -C /
```

## Troubleshooting

### MinIO Container Won't Start

1. Check if port 9000 or 9001 is already in use:
   ```bash
   lsof -i :9000
   lsof -i :9001
   ```

2. View container logs:
   ```bash
   docker-compose logs minio
   ```

3. Verify volume permissions:
   ```bash
   docker volume inspect dentalos-minio-data
   ```

### MinIO Buckets Not Created

1. Check initialization container status:
   ```bash
   docker-compose ps minio-init
   docker-compose logs minio-init
   ```

2. Manually run initialization:
   ```bash
   docker-compose up minio-init
   ```

### MailHog Not Receiving Emails

1. Verify SMTP configuration in your application
2. Check if port 1025 is accessible:
   ```bash
   telnet localhost 1025
   ```

3. View MailHog logs:
   ```bash
   docker-compose logs mailhog
   ```

### Cannot Access Web Interfaces

1. Verify services are running:
   ```bash
   docker-compose ps
   ```

2. Check port mappings:
   ```bash
   docker-compose port minio 9001
   docker-compose port mailhog 8025
   ```

3. Verify network connectivity:
   ```bash
   curl -I http://localhost:9001
   curl -I http://localhost:8025
   ```

## Environment Variables

Add these to your `.env` file for customization:

```env
# MinIO Configuration
MINIO_ROOT_USER=minioadmin
MINIO_ROOT_PASSWORD=minioadmin
HOST_MINIO_API_PORT=9000
HOST_MINIO_CONSOLE_PORT=9001

# MailHog Configuration
HOST_MAILHOG_SMTP_PORT=1025
HOST_MAILHOG_UI_PORT=8025
```

## Integration with Services

### Inventory Service (MinIO)

The inventory service is already configured to use MinIO for document storage. Ensure these environment variables are set:

```env
STORAGE_ENDPOINT=http://minio:9000
STORAGE_ACCESS_KEY_ID=minioadmin
STORAGE_SECRET_ACCESS_KEY=minioadmin
STORAGE_BUCKET=dentalos-documents
STORAGE_REGION=us-east-1
```

### Email Services (MailHog)

Configure any service that sends emails to use MailHog:

```env
SMTP_HOST=mailhog
SMTP_PORT=1025
SMTP_SECURE=false
SMTP_USER=
SMTP_PASS=
```

## Production Considerations

**Important**: These services are for local development only.

In production:
- Use **AWS S3** or similar managed object storage instead of MinIO
- Use **AWS SES**, **SendGrid**, or similar email service instead of MailHog
- Configure proper authentication, encryption, and access controls
- Implement backup and disaster recovery procedures
- Enable monitoring and alerting

## Additional Resources

- [MinIO Documentation](https://min.io/docs/minio/linux/index.html)
- [MailHog Documentation](https://github.com/mailhog/MailHog)
- [MinIO Client (mc) Documentation](https://min.io/docs/minio/linux/reference/minio-mc.html)
