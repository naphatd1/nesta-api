#!/bin/bash

# Development environment setup script

set -e

echo "🚀 Starting development environment..."

# Stop any running containers
docker-compose -f docker-compose.dev.yml down

# Build and start development environment
docker-compose -f docker-compose.dev.yml up --build -d

echo "⏳ Waiting for services to be ready..."

# Wait for database to be ready
until docker-compose -f docker-compose.dev.yml exec postgres-dev pg_isready -U postgres; do
  echo "Waiting for PostgreSQL..."
  sleep 2
done

echo "📊 Running database migrations..."

# Run Prisma migrations
docker-compose -f docker-compose.dev.yml exec app-dev npx prisma db push

echo "🌱 Seeding database..."

# Seed database
docker-compose -f docker-compose.dev.yml exec app-dev npx prisma db seed

echo "✅ Development environment is ready!"
echo "🌐 API available at: http://localhost:4001/api"
echo "📊 Database available at: localhost:5433"
echo "🔴 Redis available at: localhost:6380"

# Show running containers
docker-compose -f docker-compose.dev.yml ps