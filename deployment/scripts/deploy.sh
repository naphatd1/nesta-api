#!/bin/bash

# Deploy script for Ubuntu server
set -e

echo "🚀 Starting deployment to Ubuntu server..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    print_error "Docker is not installed. Please install Docker first."
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    print_error "Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

# Create necessary directories
print_status "Creating necessary directories..."
mkdir -p uploads
mkdir -p logs

# Set proper permissions
print_status "Setting permissions..."
chmod 755 uploads
chmod 755 logs

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    print_warning ".env file not found. Creating from template..."
    cp .env.example .env
    print_warning "Please update .env file with your production values"
fi

# Pull latest images
print_status "Pulling latest Docker images..."
docker-compose pull

# Build the application
print_status "Building application..."
docker-compose build --no-cache

# Stop existing containers
print_status "Stopping existing containers..."
docker-compose down

# Start services
print_status "Starting services..."
if [ -f "docker-compose.external-db.yml" ]; then
    print_status "Using external database configuration..."
    docker-compose -f docker-compose.external-db.yml up -d
else
    docker-compose up -d
fi

# Wait for services to be ready
print_status "Waiting for services to be ready..."
sleep 30

# Run database migrations
print_status "Running database migrations..."
if [ -f "docker-compose.external-db.yml" ]; then
    docker-compose -f docker-compose.external-db.yml exec -T app npx prisma migrate deploy
else
    docker-compose exec -T app npx prisma migrate deploy
fi

# Generate Prisma client
print_status "Generating Prisma client..."
if [ -f "docker-compose.external-db.yml" ]; then
    docker-compose -f docker-compose.external-db.yml exec -T app npx prisma generate
else
    docker-compose exec -T app npx prisma generate
fi

# Seed database (optional)
read -p "Do you want to seed the database? (y/N): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    print_status "Seeding database..."
    if [ -f "docker-compose.external-db.yml" ]; then
        docker-compose -f docker-compose.external-db.yml exec -T app npx prisma db seed
    else
        docker-compose exec -T app npx prisma db seed
    fi
fi

# Check service health
print_status "Checking service health..."
sleep 10

# Check if services are running
if docker-compose ps | grep -q "Up"; then
    print_status "✅ Deployment successful!"
    print_status "Application is running on port 4000"
    print_status "Database is running on port 5434"
    print_status "Redis is running on port 6379"
    
    echo ""
    print_status "Service status:"
    docker-compose ps
    
    echo ""
    print_status "To view logs: docker-compose logs -f"
    print_status "To stop services: docker-compose down"
    print_status "To restart services: docker-compose restart"
else
    print_error "❌ Deployment failed. Check logs with: docker-compose logs"
    exit 1
fi

echo ""
print_status "🎉 Deployment completed successfully!"