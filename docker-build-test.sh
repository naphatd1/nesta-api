#!/bin/bash

# Test Docker build script
set -e

echo "🔨 Testing Docker build..."

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

# Stop and remove existing containers
print_status "Cleaning up existing containers..."
docker-compose down || true

# Remove existing image
print_status "Removing existing image..."
docker rmi nest-auth-api-app || true

# Build new image
print_status "Building Docker image..."
docker-compose build --no-cache app

# Check if build was successful
if [ $? -eq 0 ]; then
    print_status "✅ Docker build successful!"
    
    # Test run the container
    print_status "Testing container startup..."
    docker-compose up -d app
    
    # Wait a bit for startup
    sleep 10
    
    # Check if container is running
    if docker-compose ps | grep -q "Up"; then
        print_status "✅ Container is running successfully!"
        
        # Test health endpoint
        print_status "Testing health endpoint..."
        sleep 5
        if curl -f http://localhost:4000/api/health 2>/dev/null; then
            print_status "✅ Health check passed!"
        else
            print_warning "⚠️  Health check failed, but container is running"
        fi
        
        # Show logs
        print_status "Container logs:"
        docker-compose logs app
        
    else
        print_error "❌ Container failed to start"
        docker-compose logs app
        exit 1
    fi
    
else
    print_error "❌ Docker build failed"
    exit 1
fi

print_status "🎉 Build test completed!"