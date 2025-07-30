#!/bin/bash

# 🚀 Quick Start Script for Fractal Agent System
# Simple one-command startup

echo "🚀 Starting Fractal Agent System..."

# Check if Node-RED is running
if ! curl -s http://localhost:1880 >/dev/null 2>&1; then
    echo "🤖 Starting Node-RED..."
    nohup node-red --port 1880 > node-red.log 2>&1 &
    echo $! > node-red.pid
    
    echo "⏳ Waiting for Node-RED to start..."
    for i in {1..15}; do
        if curl -s http://localhost:1880 >/dev/null 2>&1; then
            echo "✅ Node-RED is ready!"
            break
        fi
        echo -n "."
        sleep 2
    done
else
    echo "✅ Node-RED is already running"
fi

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

# Start the system
echo "🎯 Starting Fractal Agent System..."
echo "Press Ctrl+C to stop"
echo ""

node autonomous_business_runner.js 