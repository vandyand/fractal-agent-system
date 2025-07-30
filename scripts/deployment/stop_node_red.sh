#!/bin/bash

# 🛑 Node-RED Stop Script

PID_FILE="node-red.pid"
NODE_RED_PORT=1880

echo "🛑 Stopping Node-RED..."

# Stop Node-RED using PID file
if [ -f "$PID_FILE" ]; then
    NODE_RED_PID=$(cat "$PID_FILE")
    if kill -0 $NODE_RED_PID 2>/dev/null; then
        echo "Stopping Node-RED (PID: $NODE_RED_PID)..."
        kill $NODE_RED_PID
        rm -f "$PID_FILE"
    fi
fi

# Kill any remaining processes on the port
if lsof -i :$NODE_RED_PORT >/dev/null 2>&1; then
    echo "Killing any remaining processes on port $NODE_RED_PORT..."
    lsof -ti:$NODE_RED_PORT | xargs kill -9 2>/dev/null || true
fi

echo "✅ Node-RED stopped." 