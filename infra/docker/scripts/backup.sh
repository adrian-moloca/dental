#!/bin/bash

# ================================
# Backup Script
# ================================
# Creates backups of all databases

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
DOCKER_DIR="$(dirname "$SCRIPT_DIR")"
BACKUP_DIR="$DOCKER_DIR/backups"

# Create backup directory with timestamp
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_PATH="$BACKUP_DIR/$TIMESTAMP"
mkdir -p "$BACKUP_PATH"

echo -e "${GREEN}================================${NC}"
echo -e "${GREEN}Database Backup${NC}"
echo -e "${GREEN}================================${NC}"
echo ""
echo "Backup directory: $BACKUP_PATH"
echo ""

# Load environment variables
if [ -f "$DOCKER_DIR/.env" ]; then
    source "$DOCKER_DIR/.env"
fi

cd "$DOCKER_DIR"

# Backup PostgreSQL
echo -e "${YELLOW}[1/3] Backing up PostgreSQL...${NC}"
docker exec dental-postgres pg_dump -U ${POSTGRES_USER:-dental_user} ${POSTGRES_DB:-dental_db} > "$BACKUP_PATH/postgres_${POSTGRES_DB:-dental_db}.sql"
echo -e "${GREEN}✓ PostgreSQL backup complete: postgres_${POSTGRES_DB:-dental_db}.sql${NC}"

# Backup MongoDB
echo ""
echo -e "${YELLOW}[2/3] Backing up MongoDB...${NC}"
docker exec dental-mongodb mongodump --archive > "$BACKUP_PATH/mongodb_dump.archive"
echo -e "${GREEN}✓ MongoDB backup complete: mongodb_dump.archive${NC}"

# Backup Redis
echo ""
echo -e "${YELLOW}[3/3] Backing up Redis...${NC}"
docker exec dental-redis redis-cli -a ${REDIS_PASSWORD:-redis_password} --rdb "$BACKUP_PATH/redis_dump.rdb" SAVE > /dev/null 2>&1
docker cp dental-redis:/data/dump.rdb "$BACKUP_PATH/redis_dump.rdb" 2>/dev/null || true
echo -e "${GREEN}✓ Redis backup complete: redis_dump.rdb${NC}"

# Create compressed archive
echo ""
echo -e "${YELLOW}Creating compressed archive...${NC}"
cd "$BACKUP_DIR"
tar -czf "${TIMESTAMP}.tar.gz" "$TIMESTAMP"
ARCHIVE_SIZE=$(du -h "${TIMESTAMP}.tar.gz" | cut -f1)
echo -e "${GREEN}✓ Archive created: ${TIMESTAMP}.tar.gz (${ARCHIVE_SIZE})${NC}"

# Remove uncompressed backup
rm -rf "$TIMESTAMP"

# Cleanup old backups (keep last 7 days)
echo ""
echo -e "${YELLOW}Cleaning up old backups (keeping last 7 days)...${NC}"
find "$BACKUP_DIR" -name "*.tar.gz" -type f -mtime +7 -delete
BACKUP_COUNT=$(ls -1 "$BACKUP_DIR"/*.tar.gz 2>/dev/null | wc -l)
echo -e "${GREEN}✓ Cleanup complete. Total backups: ${BACKUP_COUNT}${NC}"

echo ""
echo -e "${GREEN}================================${NC}"
echo -e "${GREEN}Backup Complete!${NC}"
echo -e "${GREEN}================================${NC}"
echo ""
echo "Backup location: $BACKUP_DIR/${TIMESTAMP}.tar.gz"
echo "Backup size: $ARCHIVE_SIZE"
