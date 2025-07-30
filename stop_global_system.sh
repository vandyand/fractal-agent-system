#!/bin/bash

# 🛑 Stop Global Fractal Agent System

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Configuration
NODE_RED_PORT=1880
FRACTAL_SYSTEM_DIR="$(pwd)"
PID_FILE="$FRACTAL_SYSTEM_DIR/system.pid"

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

print_header() {
    echo -e "${CYAN}================================${NC}"
    echo -e "${CYAN}$1${NC}"
    echo -e "${CYAN}================================${NC}"
}

# Function to check if port is in use
port_in_use() {
    lsof -i :$1 >/dev/null 2>&1
}

# Function to kill process on port
kill_port() {
    local port=$1
    if port_in_use $port; then
        print_warning "Port $port is in use. Attempting to kill existing process..."
        lsof -ti:$port | xargs kill -9 2>/dev/null || true
        sleep 2
    fi
}

print_header "🛑 STOPPING GLOBAL FRACTAL AGENT SYSTEM"

# Stop processes from PID file
if [ -f "$PID_FILE" ]; then
    print_status "Stopping processes from PID file..."
    while read -r pid; do
        if kill -0 "$pid" 2>/dev/null; then
            print_status "Stopping process $pid..."
            kill "$pid"
        else
            print_warning "Process $pid is not running"
        fi
    done < "$PID_FILE"
    rm -f "$PID_FILE"
    print_status "PID file removed"
else
    print_warning "No PID file found"
fi

# Kill any remaining processes on our ports
kill_port $NODE_RED_PORT

# Check if any processes are still running
if [ -f "$PID_FILE" ] || port_in_use $NODE_RED_PORT; then
    print_warning "Some processes may still be running. Force killing..."
    pkill -f "node-red" 2>/dev/null || true
    pkill -f "email_processor_server" 2>/dev/null || true
    pkill -f "fractal_system_entry" 2>/dev/null || true
    sleep 2
fi

print_status "System stopped successfully"
print_status "You can start it again with: ./start_global_system.sh" 