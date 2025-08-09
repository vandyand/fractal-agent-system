#!/bin/bash

# 🚀 Node-RED Startup Script
# This script ONLY starts Node-RED, nothing else

set -e

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
CYAN='\033[0;36m'
NC='\033[0m'

# Configuration
NODE_RED_PORT=1880
NODE_RED_URL="http://localhost:$NODE_RED_PORT"
PID_FILE="node-red.pid"
LOG_FILE="node-red.log"

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

# Function to check if a port is in use
port_in_use() {
    lsof -i :$1 >/dev/null 2>&1
}

# Function to wait for service to be ready
wait_for_service() {
    local url=$1
    local max_attempts=15
    local attempt=1
    
    print_status "Waiting for Node-RED to start..."
    
    while [ $attempt -le $max_attempts ]; do
        if curl -s "$url" >/dev/null 2>&1; then
            print_status "Node-RED is ready!"
            return 0
        fi
        
        echo -n "."
        sleep 2
        attempt=$((attempt + 1))
    done
    
    print_error "Node-RED failed to start within $((max_attempts * 2)) seconds"
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
start_node_red() {
    print_header "🤖 STARTING NODE-RED ONLY"
    echo "Starting at: $(date)"
    echo "Node-RED URL: $NODE_RED_URL"
    echo "Log file: $LOG_FILE"
    echo "PID file: $PID_FILE"
    echo ""

    # Load environment variables from project .env if present
    REPO_ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
    if [ -f "$REPO_ROOT/.env" ]; then
        print_status "Loading environment variables from .env"
        set -a
        # shellcheck disable=SC1090
        . "$REPO_ROOT/.env"
        set +a
    fi

    # Check if Node-RED is installed
    if ! command -v node-red >/dev/null 2>&1; then
        print_error "Node-RED is not installed. Please install it first:"
        echo "  npm install -g node-red"
        exit 1
    fi

    # Check if Node-RED is already running
    if port_in_use $NODE_RED_PORT; then
        print_warning "Node-RED is already running on port $NODE_RED_PORT"
        echo "URL: $NODE_RED_URL"
        echo "PID: $(lsof -ti:$NODE_RED_PORT)"
        exit 0
    fi

    # Kill any existing processes on the port
    kill_port $NODE_RED_PORT

    # Start Node-RED
    print_status "Starting Node-RED on port $NODE_RED_PORT..."
    print_status "Node-RED will be available at: $NODE_RED_URL"
    
    # Start Node-RED in background
    nohup node-red --port $NODE_RED_PORT > "$LOG_FILE" 2>&1 &
    NODE_RED_PID=$!
    
    # Save PID for cleanup
    echo $NODE_RED_PID > "$PID_FILE"
    
    print_status "Node-RED started with PID: $NODE_RED_PID"
    
    # Wait for Node-RED to be ready
    if wait_for_service "$NODE_RED_URL"; then
        print_status "✅ Node-RED is running successfully!"
        echo ""
        echo "🎯 Next steps:"
        echo "  1. Open Node-RED: $NODE_RED_URL"
        echo "  2. Run reality check: npm run reality"
        echo "  3. Run real business ops: npm run real"
        echo "  4. Run demo: npm run demo"
        echo "  5. Stop Node-RED: ./stop_node_red.sh"
        echo ""
        echo "📝 Logs: tail -f $LOG_FILE"
    else
        print_error "Node-RED failed to start properly."
        exit 1
    fi
}

# Function to stop Node-RED
stop_node_red() {
    print_header "🛑 STOPPING NODE-RED"
    
    # Stop Node-RED
    if [ -f "$PID_FILE" ]; then
        NODE_RED_PID=$(cat "$PID_FILE")
        if kill -0 $NODE_RED_PID 2>/dev/null; then
            print_status "Stopping Node-RED (PID: $NODE_RED_PID)..."
            kill $NODE_RED_PID
            rm -f "$PID_FILE"
        fi
    fi
    
    # Kill any remaining processes on the port
    kill_port $NODE_RED_PORT
    
    print_status "Node-RED stopped."
}

# Function to show status
show_status() {
    print_header "📊 NODE-RED STATUS"
    
    echo "Node-RED Status:"
    if port_in_use $NODE_RED_PORT; then
        echo -e "  ${GREEN}✓ Running on port $NODE_RED_PORT${NC}"
        echo "  URL: $NODE_RED_URL"
        if [ -f "$PID_FILE" ]; then
            echo "  PID: $(cat "$PID_FILE")"
        fi
    else
        echo -e "  ${RED}✗ Not running${NC}"
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
    echo "🤖 Node-RED Startup Script"
    echo ""
    echo "Usage: $0 [COMMAND]"
    echo ""
    echo "Commands:"
    echo "  start     Start Node-RED only"
    echo "  stop      Stop Node-RED"
    echo "  status    Show Node-RED status"
    echo "  restart   Stop and then start Node-RED"
    echo "  help      Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0 start      # Start Node-RED"
    echo "  $0 status     # Check status"
    echo "  $0 stop       # Stop Node-RED"
    echo ""
    echo "After starting Node-RED, you can:"
    echo "  • Open Node-RED: $NODE_RED_URL"
    echo "  • Run reality check: npm run reality"
    echo "  • Run real business ops: npm run real"
    echo "  • Run demo: npm run demo"
}

# Trap to handle cleanup on exit
cleanup() {
    print_warning "Received interrupt signal."
    exit 0
}

trap cleanup SIGINT SIGTERM

# Main script logic
case "${1:-start}" in
    "start")
        start_node_red
        ;;
    "stop")
        stop_node_red
        ;;
    "status")
        show_status
        ;;
    "restart")
        stop_node_red
        sleep 2
        start_node_red
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