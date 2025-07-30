# 🚀 Fractal Agent System - Startup Guide

This guide explains how to start and manage the complete fractal agent system.

## 📋 Prerequisites

Before starting the system, ensure you have:

- **Node.js** v18 or higher
- **npm** (comes with Node.js)
- **Node-RED** (will be installed automatically if missing)
- **OpenAI API Key** (configured in Node-RED)

## 🚀 Quick Start

### Option 1: One-Command Startup (Recommended)

```bash
# Start everything with one command
npm run quick:start
```

This will:

- Start Node-RED if not running
- Install dependencies if needed
- Launch the fractal agent system

### Option 2: Full System Management

```bash
# Start the complete system with full management
npm run system:start
```

This provides:

- Comprehensive dependency checking
- Detailed logging
- Process management
- Error handling

## 🛠️ System Management Commands

### Start the System

```bash
# Full startup with all checks
npm run system:start

# Or use the script directly
./start_system.sh start
```

### Check System Status

```bash
# View system status and recent logs
npm run system:status

# Or use the script directly
./start_system.sh status
```

### Stop the System

```bash
# Stop all processes and clean up
npm run system:stop

# Or use the script directly
./start_system.sh stop
```

### Restart the System

```bash
# Stop and restart everything
npm run system:restart

# Or use the script directly
./start_system.sh restart
```

## 📊 What Gets Started

When you run the startup script, the following components are launched:

### 1. Node-RED Workflow Engine

- **Port**: 1880
- **URL**: http://localhost:1880
- **Purpose**: Hosts the fractal agent workflows
- **Logs**: `node-red.log`

### 2. Fractal Agent System

- **Main Process**: `autonomous_business_runner.js`
- **Purpose**: Runs the infinite loop business system
- **Features**: Agent spawning, task execution, metrics tracking

### 3. Supporting Components

- **Agent Communication Protocol**: Inter-agent messaging
- **Real Business Operations**: Actual task execution
- **Knowledge Base**: Learning and pattern recognition

## 🔧 Configuration

### Node-RED Configuration

The system uses your existing Node-RED configuration at `~/.node-red/`. If you need to configure OpenAI API:

1. Start Node-RED: `node-red`
2. Open http://localhost:1880
3. Add OpenAI API node
4. Configure your API key
5. Deploy the flow

### Environment Variables

```bash
# Optional: Override Node-RED URL
export NODE_RED_URL=http://localhost:1880

# Optional: Set OpenAI API key
export OPENAI_API_KEY=your_api_key_here
```

## 📝 Logging

### System Logs

- **Main Log**: `system_startup.log`
- **Node-RED Log**: `node-red.log`
- **Console Output**: Real-time system status

### Viewing Logs

```bash
# View system startup logs
tail -f system_startup.log

# View Node-RED logs
tail -f node-red.log

# View recent logs
npm run system:status
```

## 🚨 Troubleshooting

### Node-RED Won't Start

```bash
# Check if port 1880 is in use
lsof -i :1880

# Kill existing processes
./start_system.sh stop

# Try starting again
npm run system:start
```

### Dependencies Missing

```bash
# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

### OpenAI API Issues

1. Check your API key in Node-RED
2. Verify API quota and limits
3. Check network connectivity

### System Won't Start

```bash
# Check prerequisites
node --version
npm --version
node-red --version

# Check system status
npm run system:status

# View detailed logs
cat system_startup.log
```

## 🎯 Available Scripts

| Script         | Command                  | Description                         |
| -------------- | ------------------------ | ----------------------------------- |
| **Main Entry** | `npm run system`         | **Standardized system entry point** |
| Quick Start    | `npm run quick:start`    | Simple one-command startup          |
| Full Start     | `npm run system:start`   | Complete system with checks         |
| Status         | `npm run system:status`  | Check system status                 |
| Stop           | `npm run system:stop`    | Stop all processes                  |
| Restart        | `npm run system:restart` | Stop and restart                    |
| Task Manager   | `npm run simple`         | Simple task management              |
| Email System   | `npm run simple:email`   | **Real email functionality**        |
| Enhanced Email | `npm run enhanced:email` | **Send AND receive emails**         |
| Enhanced Comm  | `npm run enhanced`       | Multi-agent communication           |
| Reality Check  | `npm run reality`        | See what agents actually do         |
| Real Business  | `npm run real`           | Run real business operations        |
| Demo           | `npm run demo`           | Run interactive demo                |
| Business       | `npm run business`       | Start business operations           |
| Protocol       | `npm run protocol`       | Test communication                  |

## 🔄 System Lifecycle

### Startup Sequence

1. **Prerequisites Check** - Node.js, npm, Node-RED
2. **Dependencies Install** - npm packages
3. **Node-RED Start** - Workflow engine
4. **System State Load** - Existing agents
5. **Business Runner** - Autonomous operations

### Shutdown Sequence

1. **Signal Handling** - Graceful shutdown
2. **Process Cleanup** - Kill Node-RED
3. **Port Cleanup** - Free port 1880
4. **State Save** - Preserve system state

## 🎉 Success Indicators

When the system starts successfully, you should see:

```
🚀 FRACTAL AGENT SYSTEM STARTUP
================================
✅ Node-RED is running and accessible
✅ System initialized with real data tracking
✅ Business system initialized
🔄 Starting infinite loop with business tasks...
```

## 📞 Getting Help

If you encounter issues:

1. **Check the logs**: `npm run system:status`
2. **Verify prerequisites**: Node.js, npm, Node-RED
3. **Check Node-RED**: http://localhost:1880
4. **Review this guide**: Look for troubleshooting section
5. **Check system state**: `fractal_system_state.json`

---

**🎉 Ready to start your fractal agent system!**

Run `npm run quick:start` to begin your autonomous business operations.
 