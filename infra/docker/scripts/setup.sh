#!/bin/bash

# ================================
# Docker Environment Setup Script
# ================================
# This script sets up the complete Docker development environment

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
DOCKER_DIR="$(dirname "$SCRIPT_DIR")"

echo -e "${GREEN}================================${NC}"
echo -e "${GREEN}Dental App - Docker Setup${NC}"
echo -e "${GREEN}================================${NC}"
echo ""

# Step 1: Check prerequisites
echo -e "${YELLOW}[1/6] Checking prerequisites...${NC}"

if ! command -v docker &> /dev/null; then
    echo -e "${RED}Error: Docker is not installed${NC}"
    echo "Please install Docker: https://docs.docker.com/engine/install/"
    exit 1
fi

if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
    echo -e "${RED}Error: Docker Compose is not installed${NC}"
    echo "Please install Docker Compose: https://docs.docker.com/compose/install/"
    exit 1
fi

echo -e "${GREEN}✓ Docker and Docker Compose are installed${NC}"

# Check Docker daemon
if ! docker info &> /dev/null; then
    echo -e "${RED}Error: Docker daemon is not running${NC}"
    echo "Please start Docker and try again"
    exit 1
fi

echo -e "${GREEN}✓ Docker daemon is running${NC}"

# Step 2: Create .env file if it doesn't exist
echo ""
echo -e "${YELLOW}[2/6] Setting up environment file...${NC}"

cd "$DOCKER_DIR"

if [ ! -f .env ]; then
    echo "Creating .env from .env.example..."
    cp .env.example .env
    echo -e "${GREEN}✓ Created .env file${NC}"
    echo -e "${YELLOW}⚠ WARNING: Please update passwords in .env file before starting services!${NC}"
else
    echo -e "${GREEN}✓ .env file already exists${NC}"
fi

# Step 3: Create required directories
echo ""
echo -e "${YELLOW}[3/6] Creating required directories...${NC}"

mkdir -p logs/{postgres,mongodb,redis}
mkdir -p config
mkdir -p backups

echo -e "${GREEN}✓ Created directory structure${NC}"

# Step 4: Set permissions
echo ""
echo -e "${YELLOW}[4/6] Setting permissions...${NC}"

chmod -R 755 logs/
chmod 600 .env 2>/dev/null || true

echo -e "${GREEN}✓ Set correct permissions${NC}"

# Step 5: Validate docker-compose.yml
echo ""
echo -e "${YELLOW}[5/6] Validating docker-compose configuration...${NC}"

if docker-compose config > /dev/null 2>&1 || docker compose config > /dev/null 2>&1; then
    echo -e "${GREEN}✓ Docker Compose configuration is valid${NC}"
else
    echo -e "${RED}Error: Invalid docker-compose.yml${NC}"
    exit 1
fi

# Step 6: Pull images
echo ""
echo -e "${YELLOW}[6/6] Pulling Docker images (this may take a few minutes)...${NC}"

if docker-compose pull || docker compose pull; then
    echo -e "${GREEN}✓ Successfully pulled all images${NC}"
else
    echo -e "${RED}Error: Failed to pull images${NC}"
    exit 1
fi

# Summary
echo ""
echo -e "${GREEN}================================${NC}"
echo -e "${GREEN}Setup Complete!${NC}"
echo -e "${GREEN}================================${NC}"
echo ""
echo "Next steps:"
echo "1. Review and update passwords in .env file"
echo "2. Start services: docker-compose up -d"
echo "3. Check status: docker-compose ps"
echo "4. View logs: docker-compose logs -f"
echo ""
echo "For more information, see README.md"
