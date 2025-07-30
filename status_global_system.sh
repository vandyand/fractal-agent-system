#!/bin/bash

# 📊 Status Check for Global Fractal Agent System

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
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

# Function to get public IP
get_public_ip() {
    curl -s ifconfig.me
}

# Function to check if port is in use
port_in_use() {
    lsof -i :$1 >/dev/null 2>&1
}

# Function to check if service is responding
check_service() {
    local url=$1
    local name=$2
    if curl -s "$url" >/dev/null 2>&1; then
        echo -e "  ${GREEN}✅ $name is responding${NC}"
        return 0
    else
        echo -e "  ${RED}❌ $name is not responding${NC}"
        return 1
    fi
}

print_header "📊 GLOBAL FRACTAL AGENT SYSTEM STATUS"

# Get public IP
PUBLIC_IP=$(get_public_ip)
echo -e "${CYAN}🌍 Public IP Address:${NC} $PUBLIC_IP"
echo -e "${CYAN}🔗 Node-RED Editor:${NC} http://$PUBLIC_IP:$NODE_RED_PORT/red"
echo -e "${CYAN}📊 Node-RED Dashboard:${NC} http://$PUBLIC_IP:$NODE_RED_PORT/ui"
echo -e "${CYAN}🔧 Node-RED API:${NC} http://$PUBLIC_IP:$NODE_RED_PORT/flows"
echo ""

# Check system status
echo -e "${BLUE}📋 System Status:${NC}"

if [ -f "$PID_FILE" ]; then
    echo -e "${GREEN}✅ PID file exists${NC}"
    echo "Active processes:"
    while read -r pid; do
        if kill -0 "$pid" 2>/dev/null; then
            echo -e "  ${GREEN}✅ PID $pid is running${NC}"
        else
            echo -e "  ${RED}❌ PID $pid is not running${NC}"
        fi
    done < "$PID_FILE"
else
    echo -e "${RED}❌ No PID file found${NC}"
fi

echo ""

# Check port status
echo -e "${BLUE}🔌 Port Status:${NC}"
if port_in_use $NODE_RED_PORT; then
    echo -e "  ${GREEN}✅ Port $NODE_RED_PORT is in use${NC}"
else
    echo -e "  ${RED}❌ Port $NODE_RED_PORT is not in use${NC}"
fi

echo ""

# Check service responses
echo -e "${BLUE}🌐 Service Responses:${NC}"
check_service "http://localhost:$NODE_RED_PORT" "Node-RED"
check_service "http://localhost:$NODE_RED_PORT/red" "Node-RED Editor"
check_service "http://localhost:$NODE_RED_PORT/flows" "Node-RED API"

echo ""

# Check log files
echo -e "${BLUE}📝 Log Files:${NC}"
LOG_FILES=(
    "global_system.log"
    "node-red.log"
    "email-server.log"
    "fractal-system.log"
)

for log_file in "${LOG_FILES[@]}"; do
    if [ -f "$log_file" ]; then
        size=$(du -h "$log_file" | cut -f1)
        echo -e "  ${GREEN}✅ $log_file (${size})${NC}"
    else
        echo -e "  ${YELLOW}⚠️  $log_file (not found)${NC}"
    fi
done

echo ""

# Show recent log entries
echo -e "${BLUE}📋 Recent System Log Entries:${NC}"
if [ -f "global_system.log" ]; then
    tail -5 global_system.log | while read -r line; do
        echo "  $line"
    done
else
    echo "  No system log found"
fi

echo ""

# Summary
echo -e "${BLUE}📊 Summary:${NC}"
if [ -f "$PID_FILE" ] && port_in_use $NODE_RED_PORT; then
    echo -e "${GREEN}✅ System appears to be running properly${NC}"
    echo -e "${GREEN}✅ You can access it globally at the URLs above${NC}"
else
    echo -e "${RED}❌ System may not be running properly${NC}"
    echo -e "${YELLOW}💡 Try starting it with: ./start_global_system.sh${NC}"
fi

echo ""
echo -e "${YELLOW}🛠️  Management Commands:${NC}"
echo -e "  Start:   ./start_global_system.sh"
echo -e "  Stop:    ./stop_global_system.sh"
echo -e "  Restart: ./start_global_system.sh restart"
echo -e "  Status:  ./status_global_system.sh" 