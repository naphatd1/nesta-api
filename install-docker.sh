#!/bin/bash

# Script to install Docker and Docker Compose on Ubuntu
set -e

echo "🐳 Installing Docker and Docker Compose on Ubuntu..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if running as root
if [[ $EUID -eq 0 ]]; then
   print_error "This script should not be run as root. Please run as a regular user with sudo privileges."
   exit 1
fi

# Update package index
print_status "Updating package index..."
sudo apt-get update

# Install prerequisites
print_status "Installing prerequisites..."
sudo apt-get install -y \
    apt-transport-https \
    ca-certificates \
    curl \
    gnupg \
    lsb-release

# Add Docker's official GPG key
print_status "Adding Docker's GPG key..."
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg

# Add Docker repository
print_status "Adding Docker repository..."
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu \
  $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

# Update package index again
print_status "Updating package index with Docker repository..."
sudo apt-get update

# Install Docker Engine
print_status "Installing Docker Engine..."
sudo apt-get install -y docker-ce docker-ce-cli containerd.io

# Add current user to docker group
print_status "Adding user to docker group..."
sudo usermod -aG docker $USER

# Install Docker Compose
print_status "Installing Docker Compose..."
DOCKER_COMPOSE_VERSION=$(curl -s https://api.github.com/repos/docker/compose/releases/latest | grep 'tag_name' | cut -d\" -f4)
sudo curl -L "https://github.com/docker/compose/releases/download/${DOCKER_COMPOSE_VERSION}/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Enable Docker service
print_status "Enabling Docker service..."
sudo systemctl enable docker
sudo systemctl start docker

# Verify installation
print_status "Verifying Docker installation..."
if docker --version && docker-compose --version; then
    print_status "✅ Docker and Docker Compose installed successfully!"
    print_warning "Please log out and log back in for group changes to take effect."
    print_warning "Or run: newgrp docker"
else
    print_error "❌ Installation failed. Please check the logs above."
    exit 1
fi

echo ""
print_status "🎉 Installation completed!"
print_status "Docker version: $(docker --version)"
print_status "Docker Compose version: $(docker-compose --version)"