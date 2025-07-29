#!/bin/bash

# Comprehensive Test Runner for NestJS API
set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
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

print_header() {
    echo -e "${BLUE}================================${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}================================${NC}"
}

# Function to check if server is running
check_server() {
    if node check-server.js > /dev/null 2>&1; then
        return 0
    else
        return 1
    fi
}

# Function to start server in background
start_server() {
    print_status "Starting development server..."
    npm run start:dev > server.log 2>&1 &
    SERVER_PID=$!
    echo $SERVER_PID > server.pid
    
    print_status "Waiting for server to be ready..."
    if node check-server.js wait; then
        print_status "✅ Server is ready!"
        return 0
    else
        print_error "❌ Server failed to start"
        return 1
    fi
}

# Function to stop server
stop_server() {
    if [ -f server.pid ]; then
        SERVER_PID=$(cat server.pid)
        print_status "Stopping server (PID: $SERVER_PID)..."
        kill $SERVER_PID 2>/dev/null || true
        rm -f server.pid
        sleep 2
    fi
}

# Function to run tests
run_tests() {
    local test_type=$1
    print_header "Running $test_type Tests"
    
    case $test_type in
        "all")
            node test-api.js
            ;;
        "auth")
            node test-api.js auth
            ;;
        "upload")
            node test-api.js upload
            ;;
        "monitoring")
            node test-api.js monitoring
            ;;
        "health")
            node test-api.js health
            ;;
        *)
            print_error "Unknown test type: $test_type"
            return 1
            ;;
    esac
}

# Cleanup function
cleanup() {
    print_status "Cleaning up..."
    stop_server
    rm -f server.log test-results.json
}

# Trap cleanup on exit
trap cleanup EXIT

# Main execution
main() {
    local test_type=${1:-"all"}
    local start_server_flag=${2:-"auto"}
    
    print_header "NestJS API Test Runner"
    
    # Check if server is already running
    if check_server; then
        print_status "✅ Server is already running"
        SERVER_ALREADY_RUNNING=true
    else
        if [ "$start_server_flag" = "auto" ] || [ "$start_server_flag" = "start" ]; then
            if ! start_server; then
                print_error "Failed to start server"
                exit 1
            fi
            SERVER_ALREADY_RUNNING=false
        else
            print_error "Server is not running and auto-start is disabled"
            print_status "Please start the server manually: npm run start:dev"
            exit 1
        fi
    fi
    
    # Run the tests
    if run_tests $test_type; then
        print_status "✅ All tests completed successfully!"
        exit 0
    else
        print_error "❌ Some tests failed"
        exit 1
    fi
}

# Help function
show_help() {
    echo "Usage: $0 [test_type] [server_option]"
    echo ""
    echo "Test Types:"
    echo "  all         - Run all tests (default)"
    echo "  auth        - Run authentication tests"
    echo "  upload      - Run file upload tests"
    echo "  monitoring  - Run monitoring tests"
    echo "  health      - Run health check tests"
    echo ""
    echo "Server Options:"
    echo "  auto        - Auto start/stop server (default)"
    echo "  start       - Force start server"
    echo "  no-start    - Don't start server (assume running)"
    echo ""
    echo "Examples:"
    echo "  $0                    # Run all tests with auto server management"
    echo "  $0 auth               # Run auth tests with auto server management"
    echo "  $0 all no-start       # Run all tests without starting server"
    echo "  $0 health start       # Run health tests and force start server"
}

# Check command line arguments
if [ "$1" = "--help" ] || [ "$1" = "-h" ]; then
    show_help
    exit 0
fi

# Run main function
main "$@"