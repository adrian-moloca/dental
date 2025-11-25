#!/bin/bash

# ================================
# Restore Script
# ================================
# Restores databases from backup

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

echo -e "${GREEN}================================${NC}"
echo -e "${GREEN}Database Restore${NC}"
echo -e "${GREEN}================================${NC}"
echo ""

# Check if backup directory exists
if [ ! -d "$BACKUP_DIR" ]; then
    echo -e "${RED}Error: Backup directory not found: $BACKUP_DIR${NC}"
    exit 1
fi

# List available backups
echo "Available backups:"
ls -lh "$BACKUP_DIR"/*.tar.gz 2>/dev/null || {
    echo -e "${RED}No backups found in $BACKUP_DIR${NC}"
    exit 1
}
echo ""

# Get backup file
if [ -z "$1" ]; then
    echo "Usage: $0 <backup_timestamp>"
    echo "Example: $0 20250120_143000"
    exit 1
fi

BACKUP_TIMESTAMP=$1
BACKUP_ARCHIVE="$BACKUP_DIR/${BACKUP_TIMESTAMP}.tar.gz"

if [ ! -f "$BACKUP_ARCHIVE" ]; then
    echo -e "${RED}Error: Backup not found: $BACKUP_ARCHIVE${NC}"
    exit 1
fi

echo "Restoring from: $BACKUP_ARCHIVE"
echo ""

# Warning
echo -e "${YELLOW}WARNING: This will overwrite existing data!${NC}"
read -p "Are you sure you want to continue? (yes/no): " CONFIRM

if [ "$CONFIRM" != "yes" ]; then
    echo "Restore cancelled"
    exit 0
fi

# Extract backup
echo ""
echo -e "${YELLOW}Extracting backup...${NC}"
cd "$BACKUP_DIR"
tar -xzf "${BACKUP_TIMESTAMP}.tar.gz"
RESTORE_PATH="$BACKUP_DIR/$BACKUP_TIMESTAMP"

# Load environment variables
if [ -f "$DOCKER_DIR/.env" ]; then
    source "$DOCKER_DIR/.env"
fi

cd "$DOCKER_DIR"

# Restore PostgreSQL
if [ -f "$RESTORE_PATH/postgres_${POSTGRES_DB:-dental_db}.sql" ]; then
    echo ""
    echo -e "${YELLOW}[1/3] Restoring PostgreSQL...${NC}"

    # Drop existing connections
    docker exec dental-postgres psql -U ${POSTGRES_USER:-dental_user} -d postgres -c "SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname = '${POSTGRES_DB:-dental_db}' AND pid <> pg_backend_pid();" > /dev/null 2>&1 || true

    # Drop and recreate database
    docker exec dental-postgres psql -U ${POSTGRES_USER:-dental_user} -d postgres -c "DROP DATABASE IF EXISTS ${POSTGRES_DB:-dental_db};" > /dev/null 2>&1 || true
    docker exec dental-postgres psql -U ${POSTGRES_USER:-dental_user} -d postgres -c "CREATE DATABASE ${POSTGRES_DB:-dental_db};" > /dev/null 2>&1 || true

    # Restore
    cat "$RESTORE_PATH/postgres_${POSTGRES_DB:-dental_db}.sql" | docker exec -i dental-postgres psql -U ${POSTGRES_USER:-dental_user} -d ${POSTGRES_DB:-dental_db}
    echo -e "${GREEN}✓ PostgreSQL restored${NC}"
fi

# Restore MongoDB
if [ -f "$RESTORE_PATH/mongodb_dump.archive" ]; then
    echo ""
    echo -e "${YELLOW}[2/3] Restoring MongoDB...${NC}"
    cat "$RESTORE_PATH/mongodb_dump.archive" | docker exec -i dental-mongodb mongorestore --archive --drop
    echo -e "${GREEN}✓ MongoDB restored${NC}"
fi

# Restore Redis
if [ -f "$RESTORE_PATH/redis_dump.rdb" ]; then
    echo ""
    echo -e "${YELLOW}[3/3] Restoring Redis...${NC}"
    docker exec dental-redis redis-cli -a ${REDIS_PASSWORD:-redis_password} FLUSHALL > /dev/null 2>&1 || true
    docker cp "$RESTORE_PATH/redis_dump.rdb" dental-redis:/data/dump.rdb
    docker-compose restart redis
    echo -e "${GREEN}✓ Redis restored${NC}"
fi

# Cleanup extracted backup
rm -rf "$RESTORE_PATH"

echo ""
echo -e "${GREEN}================================${NC}"
echo -e "${GREEN}Restore Complete!${NC}"
echo -e "${GREEN}================================${NC}"
