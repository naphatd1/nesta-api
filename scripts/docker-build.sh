#!/bin/bash

# Docker build script for NestJS Auth API

set -e

echo "🐳 Building Docker image for NestJS Auth API..."

# Build the Docker image
docker build -t nestauth-api:latest .

echo "✅ Docker image built successfully!"

# Optional: Tag for different environments
docker tag nestauth-api:latest nestauth-api:production

echo "🏷️  Image tagged as production"

# Show image info
docker images | grep nestauth-api

echo "🚀 Build completed!"