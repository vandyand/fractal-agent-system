# 🚀 Fractal Agent CLI - Autonomous System Controller

A terminal-based system for spawning, deploying, and running autonomous agents in Node-RED with fractal architecture capabilities.

## 🌟 Features

- **🤖 Agent Spawning**: Automatically create and deploy new agents
- **⚡ Workflow Automation**: Deploy Node-RED workflows via REST API
- **🔄 Fractal Architecture**: Agents can spawn new agents (self-similarity)
- **💾 State Persistence**: Save and load system state
- **📊 Real-time Monitoring**: Track agent deployment and execution
- **🎯 Multiple Agent Types**: Email processor, schema generator, workflow generator

## 🛠️ Installation

### Prerequisites

1. **Node.js** (v18 or higher)
2. **Node-RED** running on `http://localhost:1880`
3. **OpenAI API** configured in Node-RED

### Setup

1. **Clone or download the files**:

   ```bash
   # Make sure you have these files in your directory:
   # - fractal_agent_cli.js
   # - package.json
   # - demo_runner.js
   # - README.md
   ```

2. **Install dependencies**:

   ```bash
   npm install
   ```

3. **Make the CLI executable**:

   ```bash
   chmod +x fractal_agent_cli.js
   ```

4. **Start Node-RED** (if not already running):
   ```bash
   node-red
   ```

## 🚀 Quick Start

### 1. Run the Demo

```bash
# Automated demo
npm run demo

# Interactive demo
npm run demo -- --interactive
```

### 2. Basic CLI Usage

```bash
# Show help
node fractal_agent_cli.js help

# Spawn an agent
node fractal_agent_cli.js spawn schema_generator json_schema validation

# List all agents
node fractal_agent_cli.js list

# Run an agent
node fractal_agent_cli.js run "agent_id_here"

# Show spawn history
node fractal_agent_cli.js history
```

## 📖 Command Reference

### Spawn Agent

```bash
node fractal_agent_cli.js spawn <type> [capabilities...]
```

**Agent Types:**

- `email_processor` - Processes and analyzes email content
- `schema_generator` - Generates JSON schemas from natural language
- `workflow_generator` - Creates new Node-RED workflows

**Example:**

```bash
node fractal_agent_cli.js spawn schema_generator json_schema validation
```

### Run Agent

```bash
node fractal_agent_cli.js run <agentId> [inputData]
```

**Example:**

```bash
node fractal_agent_cli.js run "universe.galaxy.solar_system.planet.continent.country.city.building.schema_generator_1234567890" '{"description": "Customer feedback schema"}'
```

### List Agents

```bash
node fractal_agent_cli.js list
```

### Show History

```bash
node fractal_agent_cli.js history
```

### Save/Load State

```bash
# Save current state
node fractal_agent_cli.js save [filename]

# Load state from file
node fractal_agent_cli.js load [filename]
```

## 🎯 Agent Types

### 1. Email Processor Agent

- **Purpose**: Process and analyze email content
- **Capabilities**: Sentiment analysis, response generation
- **Input**: Email content
- **Output**: Analyzed email with sentiment and action items

### 2. Schema Generator Agent

- **Purpose**: Generate JSON schemas from natural language
- **Capabilities**: JSON schema creation, validation
- **Input**: Schema description
- **Output**: Valid JSON schema

### 3. Workflow Generator Agent

- **Purpose**: Create new Node-RED workflows
- **Capabilities**: Workflow generation, automation
- **Input**: Workflow request
- **Output**: Complete Node-RED workflow JSON

## 🔄 Fractal Architecture

The system implements a fractal architecture where:

- **Self-Similarity**: Each agent contains the pattern of the whole system
- **Recursive Spawning**: Agents can spawn new agents
- **Fractal Identity**: Each agent has a hierarchical ID (e.g., `universe.galaxy.solar_system.planet.continent.country.city.building.agent_type_timestamp`)
- **Fractal Memory**: Knowledge is shared across the agent hierarchy

### Fractal Agent ID Structure

```
universe.galaxy.solar_system.planet.continent.country.city.building.agent_type_timestamp
```

## 🏗️ System Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Fractal CLI   │───▶│   Node-RED API  │───▶│  Agent Workflow │
│                 │    │                 │    │                 │
│ • Spawn Agents  │    │ • Deploy Flows  │    │ • Process Data  │
│ • Run Agents    │    │ • Trigger Nodes │    │ • Generate Output│
│ • Monitor State │    │ • Get Results   │    │ • Spawn Children│
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│  State Storage  │    │  OpenAI API     │    │  Fractal Memory │
│                 │    │                 │    │                 │
│ • Save State    │    │ • Generate      │    │ • Shared        │
│ • Load State    │    │ • Process       │    │ • Distributed   │
│ • History       │    │ • Analyze       │    │ • Hierarchical  │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 🎬 Demo Examples

### Automated Demo

The demo automatically:

1. Spawns 3 different types of agents
2. Runs each agent with sample data
3. Shows system status and history
4. Saves the complete system state

### Interactive Demo

The interactive demo allows you to:

1. Spawn agents manually
2. Run agents with custom input
3. View real-time system status
4. Experiment with different configurations

## 🔧 Configuration

### Node-RED Setup

1. Ensure Node-RED is running on `http://localhost:1880`
2. Configure OpenAI API credentials in Node-RED
3. Import the automated workflow runner flow

### Environment Variables

```bash
# Optional: Override Node-RED URL
export NODE_RED_URL=http://localhost:1880

# Optional: Set OpenAI API key
export OPENAI_API_KEY=your_api_key_here
```

## 📊 Monitoring

### System State

The system maintains:

- **Deployed Agents**: Map of all active agents
- **Spawn History**: Complete history of agent spawning events
- **Workflow Status**: Deployment and execution status
- **Performance Metrics**: Response times and success rates

### Logs

- **Deployment Logs**: Workflow deployment status
- **Execution Logs**: Agent execution results
- **Error Logs**: Failed operations and debugging info

## 🚨 Troubleshooting

### Common Issues

1. **Node-RED not accessible**

   ```bash
   # Check if Node-RED is running
   curl http://localhost:1880/flows
   ```

2. **OpenAI API errors**

   - Verify API key is configured in Node-RED
   - Check API quota and limits

3. **Workflow deployment fails**
   - Check Node-RED logs for errors
   - Verify workflow JSON format
   - Ensure all required nodes are available

### Debug Mode

```bash
# Enable debug logging
DEBUG=* node fractal_agent_cli.js spawn schema_generator
```

## 🔮 Future Enhancements

- **Agent Communication**: Inter-agent messaging system
- **Load Balancing**: Distribute workload across agents
- **Machine Learning**: Agents that learn and improve
- **Visual Interface**: Web-based dashboard
- **Cloud Deployment**: Multi-instance deployment
- **Advanced Analytics**: Performance and usage analytics

## 📄 License

MIT License - see LICENSE file for details

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📞 Support

For issues and questions:

1. Check the troubleshooting section
2. Review Node-RED documentation
3. Open an issue on GitHub

---

**🎉 Welcome to the future of autonomous systems!**
