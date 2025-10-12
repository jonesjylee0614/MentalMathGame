.PHONY: help build run test clean migrate-up migrate-down

# 默认目标
.DEFAULT_GOAL := help

# 配置
BINARY_NAME=mental-math-server
CONFIG_FILE=configs/config.yaml

help: ## 显示帮助信息
	@echo "Mental Math Game Backend Makefile"
	@echo ""
	@echo "Usage:"
	@echo "  make <target>"
	@echo ""
	@echo "Targets:"
	@awk 'BEGIN {FS = ":.*?## "} /^[a-zA-Z_-]+:.*?## / {printf "  %-15s %s\n", $$1, $$2}' $(MAKEFILE_LIST)

deps: ## 安装依赖
	@echo "Installing dependencies..."
	go mod download
	go mod tidy

build: ## 编译项目
	@echo "Building..."
	go build -o bin/$(BINARY_NAME) cmd/server/main.go
	@echo "Build complete: bin/$(BINARY_NAME)"

run: ## 运行服务器
	@echo "Running server..."
	go run cmd/server/main.go

dev: ## 开发模式运行（带热重载，需要安装air）
	@echo "Running in development mode..."
	air

test: ## 运行测试
	@echo "Running tests..."
	go test -v -cover ./...

test-coverage: ## 运行测试并生成覆盖率报告
	@echo "Running tests with coverage..."
	go test -v -coverprofile=coverage.out ./...
	go tool cover -html=coverage.out -o coverage.html
	@echo "Coverage report: coverage.html"

lint: ## 代码检查
	@echo "Running linter..."
	golangci-lint run

fmt: ## 格式化代码
	@echo "Formatting code..."
	go fmt ./...
	goimports -w .

clean: ## 清理编译文件
	@echo "Cleaning..."
	rm -rf bin/
	rm -f coverage.out coverage.html
	@echo "Clean complete"

db-create: ## 创建数据库
	@echo "Creating database..."
	mysql -u root -p -e "CREATE DATABASE IF NOT EXISTS mental_math_game CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"

migrate-up: ## 执行数据库迁移（up）
	@echo "Running migrations..."
	mysql -u root -p mental_math_game < migrations/000001_init_schema.up.sql
	mysql -u root -p mental_math_game < migrations/000002_init_data.up.sql
	@echo "Migration complete"

migrate-down: ## 回滚数据库迁移（down）
	@echo "Rolling back migrations..."
	mysql -u root -p mental_math_game < migrations/000002_init_data.down.sql
	mysql -u root -p mental_math_game < migrations/000001_init_schema.down.sql
	@echo "Rollback complete"

init-db: ## 初始化数据库（创建+迁移）
	@echo "Initializing database..."
	chmod +x scripts/init_db.sh
	./scripts/init_db.sh

docker-build: ## 构建Docker镜像
	@echo "Building Docker image..."
	docker build -t mental-math-backend:latest .

docker-run: ## 运行Docker容器
	@echo "Running Docker container..."
	docker run -d -p 8080:8080 --name mental-math-backend mental-math-backend:latest

docker-stop: ## 停止Docker容器
	@echo "Stopping Docker container..."
	docker stop mental-math-backend
	docker rm mental-math-backend

swagger: ## 生成Swagger文档
	@echo "Generating Swagger docs..."
	swag init -g cmd/server/main.go

all: deps build ## 安装依赖并编译

.PHONY: deps build run dev test test-coverage lint fmt clean db-create migrate-up migrate-down init-db docker-build docker-run docker-stop swagger all

