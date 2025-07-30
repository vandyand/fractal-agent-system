#!/bin/bash

# 🚀 Global Fractal Agent System Startup Script
# This script starts the complete system and makes it accessible globally

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
FRACTAL_SYSTEM_DIR="$(pwd)"
LOG_FILE="$FRACTAL_SYSTEM_DIR/global_system.log"
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

# Function to get public IP
get_public_ip() {
    curl -s ifconfig.me
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

# Main startup function
start_global_system() {
    print_header "🚀 GLOBAL FRACTAL AGENT SYSTEM STARTUP"
    echo "Starting at: $(date)"
    echo "System directory: $FRACTAL_SYSTEM_DIR"
    echo "Log file: $LOG_FILE"
    echo ""

    # Create log file
    touch "$LOG_FILE"
    exec 1> >(tee -a "$LOG_FILE")
    exec 2> >(tee -a "$LOG_FILE" >&2)

    # Step 1: Check prerequisites
    print_header "Checking Prerequisites"
    
    if ! command -v node >/dev/null 2>&1; then
        print_error "Node.js is not installed. Please install Node.js first."
        exit 1
    fi
    
    if ! command -v npm >/dev/null 2>&1; then
        print_error "npm is not installed. Please install npm first."
        exit 1
    fi
    
    print_status "Node.js version: $(node --version)"
    print_status "npm version: $(npm --version)"
    
    # Step 2: Install dependencies if needed
    print_header "Installing Dependencies"
    
    if [ ! -d "node_modules" ]; then
        print_status "Installing npm dependencies..."
        npm install
    else
        print_status "Dependencies already installed"
    fi
    
    # Step 3: Kill any existing processes
    print_header "Cleaning Up Existing Processes"
    kill_port $NODE_RED_PORT
    
    # Step 4: Start Node-RED
    print_header "Starting Node-RED"
    print_status "Starting Node-RED on port $NODE_RED_PORT..."
    
    # Start Node-RED in background
    nohup node-red --settings settings.js > node-red.log 2>&1 &
    NODE_RED_PID=$!
    echo $NODE_RED_PID > "$PID_FILE"
    
    print_status "Node-RED started with PID: $NODE_RED_PID"
    
    # Wait for Node-RED to be ready
    if wait_for_service "http://localhost:$NODE_RED_PORT"; then
        print_status "Node-RED is ready!"
    else
        print_error "Node-RED failed to start"
        exit 1
    fi
    
    # Step 5: Start additional services
    print_header "Starting Additional Services"
    
    # Start email processor server
    print_status "Starting email processor server..."
    nohup node email_processor_server.js > email-server.log 2>&1 &
    EMAIL_PID=$!
    echo $EMAIL_PID >> "$PID_FILE"
    
    # Start fractal system entry
    print_status "Starting fractal system entry..."
    nohup node fractal_system_entry.js > fractal-system.log 2>&1 &
    FRACTAL_PID=$!
    echo $FRACTAL_PID >> "$PID_FILE"
    
    # Step 6: Display access information
    print_header "🌐 GLOBAL ACCESS INFORMATION"
    
    PUBLIC_IP=$(get_public_ip)
    
    echo -e "${GREEN}✅ System is now running and accessible globally!${NC}"
    echo ""
    echo -e "${CYAN}🌍 Public IP Address:${NC} $PUBLIC_IP"
    echo -e "${CYAN}🔗 Node-RED Editor:${NC} http://$PUBLIC_IP:$NODE_RED_PORT/red"
    echo -e "${CYAN}📊 Node-RED Dashboard:${NC} http://$PUBLIC_IP:$NODE_RED_PORT/ui"
    echo -e "${CYAN}🔧 Node-RED API:${NC} http://$PUBLIC_IP:$NODE_RED_PORT/flows"
    echo ""
    echo -e "${YELLOW}📝 Log files:${NC}"
    echo -e "  - System log: $LOG_FILE"
    echo -e "  - Node-RED log: node-red.log"
    echo -e "  - Email server log: email-server.log"
    echo -e "  - Fractal system log: fractal-system.log"
    echo ""
    echo -e "${YELLOW}🛑 To stop the system:${NC} ./stop_global_system.sh"
    echo -e "${YELLOW}📊 To check status:${NC} ./status_global_system.sh"
    echo ""
    
    # Step 7: Test endpoints
    print_header "Testing Endpoints"
    
    print_status "Testing Node-RED editor..."
    if curl -s "http://localhost:$NODE_RED_PORT/red" >/dev/null 2>&1; then
        print_status "✅ Node-RED editor is accessible"
    else
        print_warning "⚠️  Node-RED editor may not be fully loaded yet"
    fi
    
    print_status "Testing Node-RED API..."
    if curl -s "http://localhost:$NODE_RED_PORT/flows" >/dev/null 2>&1; then
        print_status "✅ Node-RED API is accessible"
    else
        print_warning "⚠️  Node-RED API may not be fully loaded yet"
    fi
    
    print_header "🎉 SYSTEM STARTUP COMPLETE"
    echo "Your fractal agent system is now running and accessible globally!"
    echo "You can access it from anywhere in the world using the URLs above."
    echo ""
    echo "Next steps:"
    echo "1. Open the Node-RED editor to configure your flows"
    echo "2. Import the email processing flows"
    echo "3. Set up your Gmail integration"
    echo "4. Configure your fractal agents"
    echo ""
    echo "System will continue running in the background."
    echo "Check the log files for any issues."
}

# Function to stop the system
stop_system() {
    print_header "🛑 STOPPING GLOBAL FRACTAL AGENT SYSTEM"
    
    if [ -f "$PID_FILE" ]; then
        print_status "Stopping processes..."
        while read -r pid; do
            if kill -0 "$pid" 2>/dev/null; then
                print_status "Stopping process $pid..."
                kill "$pid"
            fi
        done < "$PID_FILE"
        rm -f "$PID_FILE"
    fi
    
    # Kill any remaining processes on our ports
    kill_port $NODE_RED_PORT
    
    print_status "System stopped"
}

# Function to show status
show_status() {
    print_header "📊 GLOBAL FRACTAL AGENT SYSTEM STATUS"
    
    PUBLIC_IP=$(get_public_ip)
    
    echo -e "${CYAN}🌍 Public IP Address:${NC} $PUBLIC_IP"
    echo -e "${CYAN}🔗 Node-RED Editor:${NC} http://$PUBLIC_IP:$NODE_RED_PORT/red"
    echo ""
    
    if [ -f "$PID_FILE" ]; then
        echo -e "${GREEN}✅ System is running${NC}"
        echo "Active processes:"
        while read -r pid; do
            if kill -0 "$pid" 2>/dev/null; then
                echo -e "  ✅ PID $pid is running"
            else
                echo -e "  ❌ PID $pid is not running"
            fi
        done < "$PID_FILE"
    else
        echo -e "${RED}❌ System is not running${NC}"
    fi
    
    echo ""
    if port_in_use $NODE_RED_PORT; then
        echo -e "${GREEN}✅ Port $NODE_RED_PORT is in use${NC}"
    else
        echo -e "${RED}❌ Port $NODE_RED_PORT is not in use${NC}"
    fi
}

# Main script logic
case "${1:-start}" in
    start)
        start_global_system
        ;;
    stop)
        stop_system
        ;;
    restart)
        stop_system
        sleep 2
        start_global_system
        ;;
    status)
        show_status
        ;;
    *)
        echo "Usage: $0 {start|stop|restart|status}"
        echo ""
        echo "Commands:"
        echo "  start   - Start the global fractal agent system"
        echo "  stop    - Stop the system"
        echo "  restart - Restart the system"
        echo "  status  - Show system status"
        exit 1
        ;;
esac 