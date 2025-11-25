# ================================
# Dental Application - Docker Makefile
# ================================
# Convenience commands for managing Docker environment

.PHONY: help setup start stop restart logs ps health backup restore clean clean-all

# Default target
.DEFAULT_GOAL := help

# Colors
YELLOW := \033[1;33m
GREEN := \033[0;32m
RED := \033[0;31m
NC := \033[0m

help: ## Show this help message
	@echo "$(GREEN)Dental Application - Docker Commands$(NC)"
	@echo ""
	@echo "$(YELLOW)Usage:$(NC)"
	@echo "  make <target>"
	@echo ""
	@echo "$(YELLOW)Available targets:$(NC)"
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "  $(GREEN)%-15s$(NC) %s\n", $$1, $$2}'

setup: ## Run initial setup (create .env, directories, pull images)
	@echo "$(YELLOW)Running setup...$(NC)"
	@./scripts/setup.sh

start: ## Start all services
	@echo "$(YELLOW)Starting services...$(NC)"
	@docker-compose up -d
	@echo "$(GREEN)Services started. Run 'make ps' to check status.$(NC)"

stop: ## Stop all services (keeps data)
	@echo "$(YELLOW)Stopping services...$(NC)"
	@docker-compose stop
	@echo "$(GREEN)Services stopped.$(NC)"

restart: ## Restart all services
	@echo "$(YELLOW)Restarting services...$(NC)"
	@docker-compose restart
	@echo "$(GREEN)Services restarted.$(NC)"

down: ## Stop and remove containers (keeps volumes)
	@echo "$(YELLOW)Stopping and removing containers...$(NC)"
	@docker-compose down
	@echo "$(GREEN)Containers removed. Volumes preserved.$(NC)"

logs: ## View logs from all services
	@docker-compose logs -f

logs-postgres: ## View PostgreSQL logs
	@docker-compose logs -f postgres

logs-mongo: ## View MongoDB logs
	@docker-compose logs -f mongodb

logs-redis: ## View Redis logs
	@docker-compose logs -f redis

logs-rabbitmq: ## View RabbitMQ logs
	@docker-compose logs -f rabbitmq

logs-opensearch: ## View OpenSearch logs
	@docker-compose logs -f opensearch

ps: ## Show status of all services
	@docker-compose ps

health: ## Run health checks on all services
	@./scripts/health-check.sh

backup: ## Create backup of all databases
	@./scripts/backup.sh

restore: ## Restore from backup (usage: make restore TIMESTAMP=20250120_143000)
	@if [ -z "$(TIMESTAMP)" ]; then \
		echo "$(RED)Error: TIMESTAMP not specified$(NC)"; \
		echo "Usage: make restore TIMESTAMP=20250120_143000"; \
		exit 1; \
	fi
	@./scripts/restore.sh $(TIMESTAMP)

pull: ## Pull latest Docker images
	@echo "$(YELLOW)Pulling latest images...$(NC)"
	@docker-compose pull
	@echo "$(GREEN)Images updated.$(NC)"

build: ## Build/rebuild services
	@echo "$(YELLOW)Building services...$(NC)"
	@docker-compose build --no-cache
	@echo "$(GREEN)Build complete.$(NC)"

clean: ## Remove stopped containers and unused images
	@echo "$(YELLOW)Cleaning up...$(NC)"
	@docker-compose down
	@docker system prune -f
	@echo "$(GREEN)Cleanup complete.$(NC)"

clean-all: ## Remove everything including volumes (WARNING: deletes all data!)
	@echo "$(RED)WARNING: This will delete ALL data!$(NC)"
	@read -p "Are you sure? (yes/no): " confirm && [ "$$confirm" = "yes" ] || exit 1
	@echo "$(YELLOW)Removing all containers, volumes, and data...$(NC)"
	@docker-compose down -v
	@docker volume prune -f
	@echo "$(GREEN)All data removed.$(NC)"

reset: ## Stop services and start fresh (keeps volumes)
	@echo "$(YELLOW)Resetting services...$(NC)"
	@docker-compose down
	@docker-compose up -d
	@echo "$(GREEN)Services reset.$(NC)"

shell-postgres: ## Open PostgreSQL shell
	@docker exec -it dental-postgres psql -U dental_user -d dental_db

shell-mongo: ## Open MongoDB shell
	@docker exec -it dental-mongodb mongosh -u admin

shell-redis: ## Open Redis CLI
	@docker exec -it dental-redis redis-cli

stats: ## Show resource usage statistics
	@docker stats --no-stream

volumes: ## List all volumes
	@docker volume ls | grep dental

networks: ## List networks
	@docker network ls | grep dental

config: ## Validate docker-compose configuration
	@echo "$(YELLOW)Validating configuration...$(NC)"
	@docker-compose config
	@echo "$(GREEN)Configuration is valid.$(NC)"

update: ## Update to latest images and restart
	@echo "$(YELLOW)Updating services...$(NC)"
	@docker-compose pull
	@docker-compose up -d --force-recreate
	@echo "$(GREEN)Services updated.$(NC)"

# Service-specific commands
start-postgres: ## Start only PostgreSQL
	@docker-compose up -d postgres

start-mongo: ## Start only MongoDB
	@docker-compose up -d mongodb

start-redis: ## Start only Redis
	@docker-compose up -d redis

start-rabbitmq: ## Start only RabbitMQ
	@docker-compose up -d rabbitmq

start-opensearch: ## Start only OpenSearch
	@docker-compose up -d opensearch

restart-postgres: ## Restart PostgreSQL
	@docker-compose restart postgres

restart-mongo: ## Restart MongoDB
	@docker-compose restart mongodb

restart-redis: ## Restart Redis
	@docker-compose restart redis

restart-rabbitmq: ## Restart RabbitMQ
	@docker-compose restart rabbitmq

restart-opensearch: ## Restart OpenSearch
	@docker-compose restart opensearch
