# 🚀 Fractal Agent System v2.0

**Autonomous Multi-Agent System for Digital Business Operations**

A fully autonomous fractal multi-agent system built on Node-RED that enables agents to communicate, coordinate, and spawn new agents to create a self-replicating, self-improving digital business.

## 🏗️ **Project Structure**

```
fractal-agent-system/
├── src/                          # Source code
│   ├── agents/                   # Core agent implementations
│   │   ├── fractal_agent_cli.js          # Main CLI interface
│   │   ├── agent_communication_protocol.js # Inter-agent messaging
│   │   ├── autonomous_business_runner.js  # Business automation
│   │   └── real_business_operations.js    # Real business tasks
│   ├── services/                 # Business services
│   │   ├── email_integration_system.js    # Email processing
│   │   ├── enhanced_email_system.js       # Advanced email features
│   │   ├── simple_email_system.js         # Basic email setup
│   │   ├── cloud_email_service.js         # Cloud email service
│   │   ├── task_management_system.js      # Task management
│   │   ├── simple_task_manager.js         # Basic task management
│   │   └── email_processor_server.js      # Email server
│   ├── workflows/                # Node-RED workflow definitions
│   │   ├── email_agent_team.json          # Email processing flows
│   │   ├── email_receiver_flow.json       # Email receiving flows
│   │   ├── email_triggered_flow.json      # Email triggered actions
│   │   ├── flows.json                     # Main workflow definitions
│   │   └── working_flows.json             # Working flow examples
│   ├── utils/                    # Utility functions
│   │   ├── demo_runner.js                 # System demonstrations
│   │   ├── reality_check.js               # System verification
│   │   ├── capture_real_outputs.js        # Output capture
│   │   ├── example_usage.js               # Usage examples
│   │   └── fractal_system_entry.js        # System entry point
│   ├── config/                   # Configuration files
│   │   └── settings.js                    # System settings
│   └── index.js                  # Main entry point
├── data/                         # Persistent data storage
│   ├── business/                 # Business data
│   │   ├── real_metrics.json             # Performance metrics
│   │   ├── knowledge_base.json           # Agent knowledge
│   │   ├── deployed_workflows.json       # Workflow tracking
│   │   └── task_data.json                # Task data
│   ├── communications/           # Agent communication logs
│   │   ├── message_history.json          # Message history
│   │   ├── task_tracking.json            # Task tracking
│   │   └── enhanced_message_history.json # Enhanced messaging
│   ├── email/                    # Email system data
│   │   ├── credentials.json              # Email credentials
│   │   ├── token.json                    # OAuth tokens
│   │   ├── email_records.json            # Email records
│   │   └── enhanced_email_config.template.json # Email config
│   └── system/                   # System state
│       ├── system_state.json             # System state
│       └── verification_*.json           # System verification
├── docs/                         # Documentation
│   ├── guides/                   # Setup and usage guides
│   │   ├── README.md                      # Main documentation
│   │   ├── PROJECT_DOCUMENTATION.md       # Comprehensive docs
│   │   ├── STARTUP_GUIDE.md               # Getting started
│   │   ├── EMAIL_INTEGRATION_SUMMARY.md   # Email setup
│   │   ├── GMAIL_APP_PASSWORD_SETUP.md    # Gmail setup
│   │   ├── NODE_RED_EMAIL_SETUP.md        # Node-RED email
│   │   ├── CLOUD_DEPLOYMENT_GUIDE.md      # Cloud deployment
│   │   └── ...                            # Other guides
│   └── api/                      # API documentation
├── scripts/                      # Deployment and management scripts
│   ├── deployment/               # System deployment scripts
│   │   ├── start_global_system.sh         # Global system startup
│   │   ├── start_node_red.sh              # Node-RED management
│   │   ├── start_system.sh                # System startup
│   │   ├── quick_start.sh                 # Quick setup
│   │   └── ...                            # Other deployment scripts
│   └── management/               # System management scripts
├── tests/                        # Test files
│   ├── test_email_query.js               # Email testing
│   ├── test_gmail_api_send.js            # Gmail API testing
│   ├── local_email_test.js               # Local email testing
│   ├── gmail_setup.js                    # Gmail setup testing
│   └── ...                               # Other test files
├── package.json                  # Project configuration
└── README.md                     # This file
```

## 🚀 **Quick Start**

### **Prerequisites**
- Node.js v18 or higher
- Node-RED running on `http://localhost:1880`
- OpenAI API key configured in Node-RED

### **Installation**
```bash
# Clone the repository
git clone <repository-url>
cd fractal-agent-system

# Install dependencies
npm install

# Make scripts executable
chmod +x scripts/deployment/*.sh

# Start Node-RED (if not already running)
npm run nodered:start
```

### **Basic Usage**
```bash
# Start Node-RED (flow runtime)
npm run nodered:start

# Deploy OpenAI JSON schema flow
npm run flows:deploy

# Verify flow works (uses OPENAI_API_KEY from .env)
curl -s -X POST -H "Content-Type: application/json" \
  -d '{"model":"gpt-4.1-mini","prompt":"Return a JSON object with field x: 1","schema":{"type":"object","properties":{"x":{"type":"number"}},"required":["x"]}}' \
  http://localhost:1880/api/openai/json-schema

# Tool Registry test
npm run test:tools:registry

# Task Management (offline fallback to Tool Registry)
ALLOW_OFFLINE=true npm run test:tasks
```

## 🤖 **Agent Types**

### **Core Agents**
- **`email_processor`** - Processes and analyzes email content
- **`schema_generator`** - Creates JSON schemas from natural language
- **`workflow_generator`** - Generates Node-RED workflows

### **Business Agents**
- **`customer_support_agent`** - Handles customer inquiries
- **`inventory_agent`** - Manages inventory operations
- **`analytics_agent`** - Performs data analysis
- **`financial_agent`** - Handles financial reporting
- **`automation_agent`** - Creates and optimizes workflows

## 🔄 **Fractal Architecture**

The system implements a **fractal architecture** where:
- **Self-Similarity**: Each agent contains the pattern of the whole system
- **Recursive Spawning**: Agents can spawn new agents
- **Fractal Identity**: Each agent has a hierarchical ID (e.g., `universe.galaxy.solar_system.planet.continent.country.city.building.agent_type_timestamp`)
- **Fractal Memory**: Knowledge is shared across the agent hierarchy

## 📧 **Email Integration**

### **Setup Options**
```bash
# One-time Gmail OAuth setup (if using Gmail API)
npm run email:setup

# Local email responder test (already running in background per repo owner)
npm run email:test:local
```

### **Features**
- ✅ **Email Sending** - Gmail API integration
- ✅ **Email Templates** - Customer support, order confirmation, newsletter
- ✅ **Email Tracking** - Statistics and message records
- ✅ **Auto-Categorization** - Support, sales, technical emails
- ✅ **Priority Detection** - High, medium, low priority handling

## 🏢 **Business Operations**

### **Real Business Tasks**
```bash
# Execute real business operations
npm run real

# Start autonomous business system
npm run business

# Task management
npm run tasks
```

### **Tracked Metrics**
- **Total Operations**: Count of all agent operations
- **Success Rate**: Percentage of successful operations
- **Execution Time**: Average operation duration
- **Agent Performance**: Individual agent statistics
- **Business Impact**: Revenue and satisfaction tracking

## 🛠️ **Development**

### **Available Scripts**
```bash
# Development
npm run dev                    # Start with nodemon
npm run build                  # Build the project
npm run clean                  # Clean and reinstall dependencies

# Testing
npm run test                   # Run tests
npm run reality                # Reality check
npm run demo                   # Run demo

# System Management
npm run system:start           # Start system
npm run system:stop            # Stop system
npm run system:status          # Check status
npm run system:restart         # Restart system

# Node-RED Management
npm run nodered:start          # Start Node-RED
npm run nodered:stop           # Stop Node-RED
npm run nodered:status         # Check Node-RED status
npm run nodered:restart        # Restart Node-RED
```

### **Configuration**
- **Node-RED URL**: `http://localhost:1880` (configurable)
- **Data Storage**: `data/` directory (persistent)
- **Logs**: Console output with structured logging
- **State Persistence**: Automatic state saving/loading

## 📊 **Monitoring & Analytics**

### **Real-Time Metrics**
- **Agent Performance**: Individual agent statistics
- **Communication Volume**: Message counts and types
- **Task Completion**: Task assignment and completion rates
- **Business Impact**: Revenue and satisfaction tracking

### **Data Storage**
- **Business Data**: `data/business/`
- **Communication Logs**: `data/communications/`
- **Email Data**: `data/email/`
- **System State**: `data/system/`

## 🚀 **Deployment**

### **Local Development**
```bash
npm run dev
```

### **Production Deployment**
```bash
# Deploy to DigitalOcean (or other cloud)
npm run deploy

# Or use individual scripts
./scripts/deployment/start_global_system.sh
```

### **Cloud Deployment**
- **Railway**: Simple deployment with automatic scaling
- **DigitalOcean**: Persistent droplet deployment
- **AWS Lambda**: Serverless deployment
- **Docker**: Containerized deployment

## 🔧 **Troubleshooting**

### **Common Issues**
1. **Node-RED not accessible**
   ```bash
   npm run nodered:start
   curl http://localhost:1880/flows
   ```

2. **Email setup issues**
   ```bash
   npm run gmail:setup
   npm run test:email
   ```

3. **Agent spawning failures**
   ```bash
   npm run reality
   npm run list
   ```

### **Debug Mode**
```bash
DEBUG=* npm start
```

## 📚 **Documentation**

- **Main Documentation**: `docs/guides/PROJECT_DOCUMENTATION.md`
- **Setup Guide**: `docs/guides/STARTUP_GUIDE.md`
- **Email Setup**: `docs/guides/EMAIL_INTEGRATION_SUMMARY.md`
- **Cloud Deployment**: `docs/guides/CLOUD_DEPLOYMENT_GUIDE.md`

## 🤝 **Contributing**

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 **License**

MIT License - see LICENSE file for details

## 🎯 **Roadmap**

### **Phase 1: Foundation Services**
- [x] Fractal agent system
- [x] Email integration
- [x] Node-RED workflow management
- [x] Real metrics tracking

### **Phase 2: Business Services**
- [ ] Content creation service
- [ ] Email support service
- [ ] Schema generation service
- [ ] Payment processing integration

### **Phase 3: Autonomous Operations**
- [ ] Self-optimizing workflows
- [ ] Business intelligence agents
- [ ] Autonomous decision making
- [ ] Revenue optimization

---

**🎉 Welcome to the future of autonomous digital business!**

This system represents a new paradigm in autonomous software - a fully self-managing, self-improving digital company that can generate real revenue through multiple service streams while maintaining complete transparency and accountability. 