#!/bin/bash

# 🚀 Fractal Agent System - Complete Startup Script
# This script starts all dependencies and the fractal agent system

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Configuration
NODE_RED_PORT=1880
NODE_RED_URL="http://localhost:$NODE_RED_PORT"
FRACTAL_SYSTEM_DIR="$(pwd)"
NODE_RED_USER_DIR="$HOME/.node-red"
LOG_FILE="$FRACTAL_SYSTEM_DIR/system_startup.log"

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

# Function to check if a command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to check if a port is in use
port_in_use() {
    lsof -i :$1 >/dev/null 2>&1
}

# Function to wait for service to be ready
wait_for_service() {
    local url=$1
    local max_attempts=30
    local attempt=1
    
    print_status "Waiting for service at $url..."
    
    while [ $attempt -le $max_attempts ]; do
        if curl -s "$url" >/dev/null 2>&1; then
            print_status "Service is ready!"
            return 0
        fi
        
        echo -n "."
        sleep 2
        attempt=$((attempt + 1))
    done
    
    print_error "Service failed to start within $((max_attempts * 2)) seconds"
    return 1
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

# Main startup function
start_fractal_system() {
    print_header "🚀 FRACTAL AGENT SYSTEM STARTUP"
    echo "Starting at: $(date)"
    echo "System directory: $FRACTAL_SYSTEM_DIR"
    echo "Node-RED URL: $NODE_RED_URL"
    echo "Log file: $LOG_FILE"
    echo ""

    # Create log file
    touch "$LOG_FILE"
    exec 1> >(tee -a "$LOG_FILE")
    exec 2> >(tee -a "$LOG_FILE" >&2)

    # Step 1: Check prerequisites
    print_header "📋 CHECKING PREREQUISITES"
    
    # Check Node.js
    if ! command_exists node; then
        print_error "Node.js is not installed. Please install Node.js v18 or higher."
        exit 1
    fi
    
    NODE_VERSION=$(node --version)
    print_status "Node.js version: $NODE_VERSION"
    
    # Check npm
    if ! command_exists npm; then
        print_error "npm is not installed."
        exit 1
    fi
    
    NPM_VERSION=$(npm --version)
    print_status "npm version: $NPM_VERSION"
    
    # Check Node-RED
    if ! command_exists node-red; then
        print_warning "Node-RED is not installed globally. Installing..."
        npm install -g node-red
    fi
    
    NODE_RED_VERSION=$(node-red --version 2>/dev/null || echo "Unknown")
    print_status "Node-RED version: $NODE_RED_VERSION"
    
    # Step 2: Install project dependencies
    print_header "📦 INSTALLING PROJECT DEPENDENCIES"
    
    if [ ! -d "node_modules" ]; then
        print_status "Installing npm dependencies..."
        npm install
    else
        print_status "Dependencies already installed. Checking for updates..."
        npm install
    fi
    
    # Step 3: Check Node-RED configuration
    print_header "⚙️  CONFIGURING NODE-RED"
    
    # Ensure Node-RED user directory exists
    if [ ! -d "$NODE_RED_USER_DIR" ]; then
        print_status "Creating Node-RED user directory..."
        mkdir -p "$NODE_RED_USER_DIR"
    fi
    
    # Check for OpenAI API configuration
    if [ ! -f "$NODE_RED_USER_DIR/.config.nodes.json" ]; then
        print_warning "Node-RED configuration not found. You may need to configure OpenAI API."
    else
        print_status "Node-RED configuration found."
    fi
    
    # Step 4: Kill any existing processes on the port
    print_header "🔄 CLEANING UP EXISTING PROCESSES"
    kill_port $NODE_RED_PORT
    
    # Step 5: Start Node-RED
    print_header "🤖 STARTING NODE-RED"
    
    print_status "Starting Node-RED on port $NODE_RED_PORT..."
    print_status "Node-RED will be available at: $NODE_RED_URL"
    
    # Start Node-RED in background
    nohup node-red --port $NODE_RED_PORT > node-red.log 2>&1 &
    NODE_RED_PID=$!
    
    # Save PID for cleanup
    echo $NODE_RED_PID > node-red.pid
    
    print_status "Node-RED started with PID: $NODE_RED_PID"
    
    # Wait for Node-RED to be ready
    if ! wait_for_service "$NODE_RED_URL/flows"; then
        print_error "Node-RED failed to start properly."
        exit 1
    fi
    
    # Step 6: Deploy fractal agent workflows
    print_header "🚀 DEPLOYING FRACTAL AGENT WORKFLOWS"
    
    # Check if we have existing system state
    if [ -f "fractal_system_state.json" ]; then
        print_status "Found existing system state. Loading agents..."
        node fractal_agent_cli.js load fractal_system_state.json
    else
        print_status "No existing system state found. Starting fresh..."
    fi
    
    # Step 7: Start the fractal agent system
    print_header "🎯 STARTING FRACTAL AGENT SYSTEM"
    
    print_status "Starting autonomous business runner..."
    print_status "Press Ctrl+C to stop the system"
    echo ""
    
    # Start the autonomous business runner
    node autonomous_business_runner.js
}

# Function to stop the system
stop_system() {
    print_header "🛑 STOPPING FRACTAL AGENT SYSTEM"
    
    # Stop Node-RED
    if [ -f "node-red.pid" ]; then
        NODE_RED_PID=$(cat node-red.pid)
        if kill -0 $NODE_RED_PID 2>/dev/null; then
            print_status "Stopping Node-RED (PID: $NODE_RED_PID)..."
            kill $NODE_RED_PID
            rm -f node-red.pid
        fi
    fi
    
    # Kill any remaining processes on the port
    kill_port $NODE_RED_PORT
    
    print_status "System stopped."
}

# Function to show system status
show_status() {
    print_header "📊 SYSTEM STATUS"
    
    echo "Node-RED Status:"
    if port_in_use $NODE_RED_PORT; then
        echo -e "  ${GREEN}✓ Running on port $NODE_RED_PORT${NC}"
        echo "  URL: $NODE_RED_URL"
    else
        echo -e "  ${RED}✗ Not running${NC}"
    fi
    
    echo ""
    echo "Fractal Agent System:"
    if [ -f "fractal_system_state.json" ]; then
        AGENT_COUNT=$(node -e "const state = JSON.parse(require('fs').readFileSync('fractal_system_state.json')); console.log(state.deployedAgents ? state.deployedAgents.length : 0);" 2>/dev/null || echo "0")
        echo -e "  ${GREEN}✓ System state found${NC}"
        echo "  Deployed agents: $AGENT_COUNT"
    else
        echo -e "  ${YELLOW}⚠ No system state found${NC}"
    fi
    
    echo ""
    echo "Recent logs:"
    if [ -f "$LOG_FILE" ]; then
        tail -10 "$LOG_FILE" 2>/dev/null || echo "No log file found"
    else
        echo "No log file found"
    fi
}

# Function to show help
show_help() {
    echo "🚀 Fractal Agent System Startup Script"
    echo ""
    echo "Usage: $0 [COMMAND]"
    echo ""
    echo "Commands:"
    echo "  start     Start the complete fractal agent system"
    echo "  stop      Stop the system and clean up processes"
    echo "  status    Show system status and recent logs"
    echo "  restart   Stop and then start the system"
    echo "  help      Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0 start      # Start the complete system"
    echo "  $0 status     # Check system status"
    echo "  $0 stop       # Stop the system"
    echo ""
    echo "The system includes:"
    echo "  • Node-RED workflow engine"
    echo "  • Fractal agent CLI"
    echo "  • Autonomous business runner"
    echo "  • Inter-agent communication protocol"
    echo ""
    echo "Logs are saved to: $LOG_FILE"
}

# Trap to handle cleanup on exit
cleanup() {
    print_warning "Received interrupt signal. Cleaning up..."
    stop_system
    exit 0
}

trap cleanup SIGINT SIGTERM

# Main script logic
case "${1:-start}" in
    "start")
        start_fractal_system
        ;;
    "stop")
        stop_system
        ;;
    "status")
        show_status
        ;;
    "restart")
        stop_system
        sleep 2
        start_fractal_system
        ;;
    "help"|"-h"|"--help")
        show_help
        ;;
    *)
        print_error "Unknown command: $1"
        echo ""
        show_help
        exit 1
        ;;
esac 