#!/bin/bash

# Production environment setup script

set -e

echo "🚀 Starting production environment..."

# Stop any running containers
docker-compose down

# Build and start production environment
docker-compose up --build -d

echo "⏳ Waiting for services to be ready..."

# Wait for database to be ready
until docker-compose exec postgres pg_isready -U postgres; do
  echo "Waiting for PostgreSQL..."
  sleep 2
done

echo "📊 Running database migrations..."

# Run Prisma migrations
docker-compose exec app npx prisma db push

echo "🌱 Seeding database..."

# Seed database
docker-compose exec app npx prisma db seed

echo "✅ Production environment is ready!"
echo "🌐 API available at: http://localhost/api"
echo "🌐 Direct API access: http://localhost:4000/api"

# Show running containers
docker-compose ps