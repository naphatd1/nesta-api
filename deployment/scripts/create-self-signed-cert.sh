#!/bin/bash

# Create self-signed SSL certificate
set -e

echo "🔐 Creating self-signed SSL certificate..."

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

# Get server IP
SERVER_IP=$(curl -s ifconfig.me)
print_status "Server IP: $SERVER_IP"

# Create SSL directory
sudo mkdir -p /etc/ssl/private
sudo mkdir -p /etc/ssl/certs

# Generate private key
print_status "Generating private key..."
sudo openssl genrsa -out /etc/ssl/private/nginx-selfsigned.key 2048

# Generate certificate
print_status "Generating certificate..."
sudo openssl req -new -x509 -key /etc/ssl/private/nginx-selfsigned.key \
    -out /etc/ssl/certs/nginx-selfsigned.crt -days 365 \
    -subj "/C=TH/ST=Bangkok/L=Bangkok/O=YourCompany/OU=IT/CN=$SERVER_IP"

# Generate strong DH group
print_status "Generating DH parameters (this may take a while)..."
sudo openssl dhparam -out /etc/ssl/certs/dhparam.pem 2048

# Set proper permissions
sudo chmod 600 /etc/ssl/private/nginx-selfsigned.key
sudo chmod 644 /etc/ssl/certs/nginx-selfsigned.crt
sudo chmod 644 /etc/ssl/certs/dhparam.pem

print_status "✅ Self-signed certificate created successfully!"
print_warning "Certificate is valid for IP: $SERVER_IP"
print_warning "Browsers will show security warning for self-signed certificates"

echo ""
print_status "Certificate files created:"
echo "  Private key: /etc/ssl/private/nginx-selfsigned.key"
echo "  Certificate: /etc/ssl/certs/nginx-selfsigned.crt"
echo "  DH params: /etc/ssl/certs/dhparam.pem"