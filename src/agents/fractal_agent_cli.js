#!/usr/bin/env node

const axios = require("axios");
const fs = require("fs");
const path = require("path");

class FractalAgentCLI {
  constructor() {
    this.nodeRedUrl = process.env.NODE_RED_URL || "http://localhost:1880";
    this.deployedAgents = new Map();
    this.spawnHistory = [];
  }

  // Initialize the CLI
  async init() {
    console.log("🚀 Fractal Agent CLI - Autonomous System Controller");
    console.log("==================================================\n");

    // Check if Node-RED is running
    try {
      await axios.get(`${this.nodeRedUrl}/flows`);
      console.log("✅ Node-RED is running and accessible");
    } catch (error) {
      if (process.env.ALLOW_OFFLINE === "true") {
        console.warn(
          "⚠️ Node-RED is not accessible, but ALLOW_OFFLINE=true - continuing in offline mode"
        );
      } else {
        throw new Error(
          `Node-RED not accessible at ${this.nodeRedUrl}. Start Node-RED or set NODE_RED_URL`
        );
      }
    }
  }

  // Spawn a new agent
  async spawnAgent(
    agentType,
    capabilities = [],
    parentId = "universe.galaxy.solar_system.planet.continent.country.city.building"
  ) {
    console.log(`🤖 Spawning ${agentType} agent...`);

    const spawnRequest = {
      reason: "workload_distribution",
      agent_type: agentType,
      capabilities: capabilities,
      autonomy_level: "full",
    };

    try {
      // Generate workflow for the new agent
      const workflow = await this.generateAgentWorkflow(
        agentType,
        capabilities,
        parentId
      );

      // Deploy the workflow
      const deploymentResult = await this.deployWorkflow(
        workflow,
        `${agentType}_${Date.now()}`
      );

      // Store agent information
      const agentId = `${parentId}.${agentType}_${Date.now()}`;
      this.deployedAgents.set(agentId, {
        type: agentType,
        capabilities: capabilities,
        workflow: workflow,
        deploymentResult: deploymentResult,
        spawnTime: new Date().toISOString(),
      });

      // Log spawn event
      this.spawnHistory.push({
        timestamp: new Date().toISOString(),
        event_type: "agent_spawned",
        parent_agent: parentId,
        child_agent: agentId,
        agent_type: agentType,
        capabilities: capabilities,
      });

      console.log(`✅ Agent spawned successfully: ${agentId}`);
      return agentId;
    } catch (error) {
      console.error(`❌ Failed to spawn agent: ${error.message}`);
      throw error;
    }
  }

  // Generate workflow for a specific agent type
  async generateAgentWorkflow(agentType, capabilities, parentId) {
    const templates = {
      email_processor: {
        name: "Email Processing Agent",
        description: "Processes and analyzes email content",
        nodes: [
          {
            id: "email_input",
            type: "inject",
            name: "Email Input",
            props: [{ p: "payload.email_content", v: "", vt: "str" }],
          },
          {
            id: "email_analyzer",
            type: "function",
            name: "Email Analyzer",
            func: `// Analyze email content
const email = msg.payload.email_content;

msg.payload = {
    sentiment: 'positive',
    urgency: 'medium',
    action_required: true,
    response_needed: true
};

return msg;`,
          },
          {
            id: "response_generator",
            type: "OpenAI API",
            name: "Response Generator",
            service: "f62f0360cc9daa6a",
            method: "createChatCompletion",
          },
        ],
        connections: [
          { from: "email_input", to: "email_analyzer" },
          { from: "email_analyzer", to: "response_generator" },
        ],
      },

      schema_generator: {
        name: "Schema Generator Agent",
        description: "Generates JSON schemas from natural language",
        nodes: [
          {
            id: "schema_input",
            type: "inject",
            name: "Schema Description",
            props: [{ p: "payload.description", v: "", vt: "str" }],
          },
          {
            id: "schema_generator",
            type: "function",
            name: "Schema Generator",
            func: `// Generate schema from description
const description = msg.payload.description;

msg.payload = {
    model: 'gpt-4o-mini',
    response_format: {type: 'json_object'},
    messages: [{
        role: 'user',
        content: \`Create a JSON schema for: \${description}\`
    }]
};

return msg;`,
          },
          {
            id: "openai_call",
            type: "OpenAI API",
            name: "Generate Schema",
            service: "f62f0360cc9daa6a",
            method: "createChatCompletion",
          },
        ],
        connections: [
          { from: "schema_input", to: "schema_generator" },
          { from: "schema_generator", to: "openai_call" },
        ],
      },

      workflow_generator: {
        name: "Workflow Generator Agent",
        description: "Generates new Node-RED workflows",
        nodes: [
          {
            id: "workflow_request",
            type: "inject",
            name: "Workflow Request",
            props: [{ p: "payload.request", v: "", vt: "str" }],
          },
          {
            id: "workflow_generator",
            type: "function",
            name: "Workflow Generator",
            func: `// Generate workflow from request
const request = msg.payload.request;

msg.payload = {
    model: 'gpt-4o-mini',
    response_format: {type: 'json_object'},
    messages: [{
        role: 'user',
        content: \`Create a Node-RED workflow JSON for: \${request}. Include all necessary nodes, connections, and configurations.\`
    }]
};

return msg;`,
          },
          {
            id: "openai_workflow",
            type: "OpenAI API",
            name: "Generate Workflow",
            service: "f62f0360cc9daa6a",
            method: "createChatCompletion",
          },
        ],
        connections: [
          { from: "workflow_request", to: "workflow_generator" },
          { from: "workflow_generator", to: "openai_workflow" },
        ],
      },

      // Business Agent Templates
      customer_support_agent: {
        name: "Customer Support Agent",
        description: "Handles customer inquiries and support requests",
        nodes: [
          {
            id: "support_input",
            type: "inject",
            name: "Support Request",
            props: [
              { p: "payload.customer_email", v: "", vt: "str" },
              { p: "payload.order_id", v: "", vt: "str" },
              { p: "payload.inquiry", v: "", vt: "str" },
            ],
          },
          {
            id: "support_processor",
            type: "function",
            name: "Support Processor",
            func: `// Process customer support request
const email = msg.payload.customer_email;
const orderId = msg.payload.order_id;
const inquiry = msg.payload.inquiry;

msg.payload = {
    model: 'gpt-4o-mini',
    response_format: {type: 'json_object'},
    messages: [{
        role: 'user',
        content: \`Customer support request: \${inquiry}\\nOrder ID: \${orderId}\\nCustomer Email: \${email}\\n\\nGenerate a professional response with order status and tracking information.\`
    }]
};

return msg;`,
          },
          {
            id: "support_response",
            type: "OpenAI API",
            name: "Generate Response",
            service: "f62f0360cc9daa6a",
            method: "createChatCompletion",
          },
        ],
        connections: [
          { from: "support_input", to: "support_processor" },
          { from: "support_processor", to: "support_response" },
        ],
      },

      inventory_agent: {
        name: "Inventory Management Agent",
        description: "Manages inventory levels and supplier relationships",
        nodes: [
          {
            id: "inventory_input",
            type: "inject",
            name: "Inventory Check",
            props: [
              { p: "payload.product_id", v: "", vt: "str" },
              { p: "payload.current_stock", v: 0, vt: "num" },
              { p: "payload.reorder_threshold", v: 0, vt: "num" },
            ],
          },
          {
            id: "inventory_analyzer",
            type: "function",
            name: "Inventory Analyzer",
            func: `// Analyze inventory levels
const productId = msg.payload.product_id;
const currentStock = msg.payload.current_stock;
const reorderThreshold = msg.payload.reorder_threshold;

const needsReorder = currentStock <= reorderThreshold;

msg.payload = {
    model: 'gpt-4o-mini',
    response_format: {type: 'json_object'},
    messages: [{
        role: 'user',
        content: \`Inventory Analysis:\\nProduct ID: \${productId}\\nCurrent Stock: \${currentStock}\\nReorder Threshold: \${reorderThreshold}\\nNeeds Reorder: \${needsReorder}\\n\\nGenerate inventory report and reorder recommendation.\`
    }]
};

return msg;`,
          },
          {
            id: "inventory_report",
            type: "OpenAI API",
            name: "Generate Report",
            service: "f62f0360cc9daa6a",
            method: "createChatCompletion",
          },
        ],
        connections: [
          { from: "inventory_input", to: "inventory_analyzer" },
          { from: "inventory_analyzer", to: "inventory_report" },
        ],
      },

      analytics_agent: {
        name: "Analytics Agent",
        description: "Analyzes data and generates business insights",
        nodes: [
          {
            id: "analytics_input",
            type: "inject",
            name: "Data Input",
            props: [{ p: "payload.feedback_data", v: [], vt: "json" }],
          },
          {
            id: "analytics_processor",
            type: "function",
            name: "Analytics Processor",
            func: `// Process analytics data
const feedbackData = msg.payload.feedback_data;

msg.payload = {
    model: 'gpt-4o-mini',
    response_format: {type: 'json_object'},
    messages: [{
        role: 'user',
        content: \`Analyze this customer feedback data:\\n\${JSON.stringify(feedbackData, null, 2)}\\n\\nGenerate sentiment analysis and improvement recommendations.\`
    }]
};

return msg;`,
          },
          {
            id: "analytics_report",
            type: "OpenAI API",
            name: "Generate Analysis",
            service: "f62f0360cc9daa6a",
            method: "createChatCompletion",
          },
        ],
        connections: [
          { from: "analytics_input", to: "analytics_processor" },
          { from: "analytics_processor", to: "analytics_report" },
        ],
      },

      financial_agent: {
        name: "Financial Agent",
        description: "Handles financial reporting and analysis",
        nodes: [
          {
            id: "financial_input",
            type: "inject",
            name: "Financial Data",
            props: [{ p: "payload.sales_data", v: [], vt: "json" }],
          },
          {
            id: "financial_processor",
            type: "function",
            name: "Financial Processor",
            func: `// Process financial data
const salesData = msg.payload.sales_data;

msg.payload = {
    model: 'gpt-4o-mini',
    response_format: {type: 'json_object'},
    messages: [{
        role: 'user',
        content: \`Generate a daily sales report from this data:\\n\${JSON.stringify(salesData, null, 2)}\\n\\nInclude total revenue, top products, and key insights.\`
    }]
};

return msg;`,
          },
          {
            id: "financial_report",
            type: "OpenAI API",
            name: "Generate Report",
            service: "f62f0360cc9daa6a",
            method: "createChatCompletion",
          },
        ],
        connections: [
          { from: "financial_input", to: "financial_processor" },
          { from: "financial_processor", to: "financial_report" },
        ],
      },

      automation_agent: {
        name: "Automation Agent",
        description: "Creates and optimizes business workflows",
        nodes: [
          {
            id: "automation_input",
            type: "inject",
            name: "Automation Request",
            props: [{ p: "payload.request", v: "", vt: "str" }],
          },
          {
            id: "automation_processor",
            type: "function",
            name: "Automation Processor",
            func: `// Process automation request
const request = msg.payload.request;

msg.payload = {
    model: 'gpt-4o-mini',
    response_format: {type: 'json_object'},
    messages: [{
        role: 'user',
        content: \`Create an automated workflow for: \${request}\\n\\nGenerate a complete Node-RED workflow JSON with all necessary nodes and connections.\`
    }]
};

return msg;`,
          },
          {
            id: "automation_workflow",
            type: "OpenAI API",
            name: "Generate Workflow",
            service: "f62f0360cc9daa6a",
            method: "createChatCompletion",
          },
        ],
        connections: [
          { from: "automation_input", to: "automation_processor" },
          { from: "automation_processor", to: "automation_workflow" },
        ],
      },
    };

    const template = templates[agentType];
    if (!template) {
      throw new Error(`No template found for agent type: ${agentType}`);
    }

    // Generate unique IDs
    const timestamp = Date.now();
    const uniqueId = `${agentType}_${timestamp}`;

    // Create workflow structure
    const workflow = {
      id: uniqueId,
      type: "tab",
      label: template.name,
      disabled: false,
      info: template.description,
    };

    // Convert template nodes to Node-RED format
    const nodes = template.nodes.map((node, index) => ({
      id: `${uniqueId}_${node.id}_${index}`,
      type: node.type,
      z: uniqueId,
      name: node.name,
      ...(node.props && { props: node.props }),
      ...(node.func && { func: node.func }),
      ...(node.service && { service: node.service }),
      ...(node.method && { method: node.method }),
      x: 200 + index * 200,
      y: 200,
      wires: [],
    }));

    // Add connections
    template.connections.forEach((conn) => {
      const fromNode = nodes.find((n) => n.name === conn.from);
      const toNode = nodes.find((n) => n.name === conn.to);
      if (fromNode && toNode) {
        fromNode.wires = [[toNode.id]];
      }
    });

    // Add service host
    const serviceHost = {
      id: `${uniqueId}_service_host`,
      type: "Service Host",
      apiBase: "https://api.openai.com/v1",
      secureApiKeyHeaderOrQueryName: "Authorization",
      organizationId: "",
      name: "",
    };

    return [workflow, ...nodes, serviceHost];
  }

  // Deploy workflow to Node-RED
  async deployWorkflow(workflow, workflowName) {
    console.log(`📦 Deploying workflow: ${workflowName}`);

    try {
      // Load current flows
      const { NodeRedClient } = require('../services/node_red_client');
      const client = new NodeRedClient(this.nodeRedUrl);
      await client.ensureAvailable();
      const response = await client.deployFlowSet(workflow);

      if (response && (response.status === 200 || response.status === 204)) {
        console.log(`✅ Workflow deployed successfully: ${workflowName}`);
        return {
          success: true,
          workflowName: workflowName,
          nodeCount: workflow.filter((n) => n.type !== "tab").length,
          timestamp: new Date().toISOString(),
        };
      } else {
        throw new Error(`Deployment failed with status: ${response?.status}`);
      }
    } catch (error) {
      console.error(`❌ Workflow deployment failed: ${error.message}`);
      if (error.response) {
        console.error(
          `Response data: ${JSON.stringify(error.response.data, null, 2)}`
        );
      }
      throw error;
    }
  }

  // Trigger a specific node
  async triggerNode(nodeId, payload = {}) {
    console.log(`⚡ Triggering node: ${nodeId}`);

    try {
      const response = await axios.post(
        `${this.nodeRedUrl}/inject/${nodeId}`,
        payload
      );

      if (response.status === 200) {
        console.log(`✅ Node triggered successfully: ${nodeId}`);
        return response.data;
      } else {
        throw new Error(`Node trigger failed with status: ${response.status}`);
      }
    } catch (error) {
      console.error(`❌ Node trigger failed: ${error.message}`);
      throw error;
    }
  }

  // Run a complete agent workflow
  async runAgent(agentId, inputData = {}) {
    console.log(`🏃 Running agent: ${agentId}`);

    const agent = this.deployedAgents.get(agentId);
    if (!agent) {
      throw new Error(`Agent not found: ${agentId}`);
    }

    try {
      // Find inject nodes in the workflow
      const injectNodes = agent.workflow.filter(
        (node) => node.type === "inject"
      );

      // Trigger each inject node
      for (const node of injectNodes) {
        await this.triggerNode(node.id, inputData);
        // Add delay between triggers
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }

      console.log(`✅ Agent execution completed: ${agentId}`);
      return {
        success: true,
        agentId: agentId,
        nodesTriggered: injectNodes.length,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      console.error(`❌ Agent execution failed: ${error.message}`);
      throw error;
    }
  }

  // List all deployed agents
  listAgents() {
    console.log("\n🤖 Deployed Agents:");
    console.log("==================");

    if (this.deployedAgents.size === 0) {
      console.log("No agents deployed yet.");
      return;
    }

    this.deployedAgents.forEach((agent, agentId) => {
      console.log(`\n📋 Agent ID: ${agentId}`);
      console.log(`   Type: ${agent.type}`);
      console.log(`   Capabilities: ${agent.capabilities.join(", ")}`);
      console.log(`   Spawned: ${agent.spawnTime}`);
      console.log(
        `   Nodes: ${agent.workflow.filter((n) => n.type !== "tab").length}`
      );
    });
  }

  // Show spawn history
  showHistory() {
    console.log("\n📜 Spawn History:");
    console.log("================");

    if (this.spawnHistory.length === 0) {
      console.log("No spawn events recorded.");
      return;
    }

    this.spawnHistory.forEach((event, index) => {
      console.log(`\n${index + 1}. ${event.timestamp}`);
      console.log(`   Event: ${event.event_type}`);
      console.log(`   Parent: ${event.parent_agent}`);
      console.log(`   Child: ${event.child_agent}`);
      console.log(`   Type: ${event.agent_type}`);
      console.log(`   Capabilities: ${event.capabilities.join(", ")}`);
    });
  }

  // Save system state to file
  saveState(filename = "fractal_system_state.json") {
    const state = {
      deployedAgents: Array.from(this.deployedAgents.entries()),
      spawnHistory: this.spawnHistory,
      timestamp: new Date().toISOString(),
    };

    const stateFile = path.join(process.cwd(), "data/system", filename);
    fs.writeFileSync(stateFile, JSON.stringify(state, null, 2));
    console.log(`💾 System state saved to: ${stateFile}`);
  }

  // Load system state from file
  loadState(filename = "fractal_system_state.json") {
    const stateFile = path.join(process.cwd(), "data/system", filename);
    if (fs.existsSync(stateFile)) {
      const state = JSON.parse(fs.readFileSync(stateFile, "utf8"));
      this.deployedAgents = new Map(state.deployedAgents);
      this.spawnHistory = state.spawnHistory;
      console.log(`📂 System state loaded from: ${stateFile}`);
      console.log(`   Agents: ${this.deployedAgents.size}`);
      console.log(`   History: ${this.spawnHistory.length} events`);
    } else {
      console.log(`📂 No state file found: ${stateFile}`);
    }
  }

  // Show help
  showHelp() {
    console.log("\n📖 Fractal Agent CLI Commands:");
    console.log("=============================");
    console.log("spawn <type> [capabilities] - Spawn a new agent");
    console.log("run <agentId> [input]      - Run an agent");
    console.log("list                       - List all agents");
    console.log("history                    - Show spawn history");
    console.log("save [filename]            - Save system state");
    console.log("load [filename]            - Load system state");
    console.log("deploy <workflow_file>     - Deploy a workflow to Node-RED");
    console.log("help                       - Show this help");
    console.log("exit                       - Exit the CLI");
    console.log("\nAgent Types:");
    console.log("- email_processor");
    console.log("- schema_generator");
    console.log("- workflow_generator");
    console.log("- customer_support_agent");
    console.log("- inventory_agent");
    console.log("- analytics_agent");
    console.log("- financial_agent");
    console.log("- automation_agent");
  }
}

// CLI Interface
async function main() {
  const cli = new FractalAgentCLI();
  await cli.init();

  // Load previous state if exists
  cli.loadState();

  // Simple command line interface
  const args = process.argv.slice(2);

  if (args.length === 0) {
    cli.showHelp();
    return;
  }

  const command = args[0];

  try {
    switch (command) {
      case "spawn":
        if (args.length < 2) {
          console.log("❌ Usage: spawn <type> [capabilities]");
          return;
        }
        const agentType = args[1];
        const capabilities = args.slice(2);
        await cli.spawnAgent(agentType, capabilities);
        break;

      case "run":
        if (args.length < 2) {
          console.log("❌ Usage: run <agentId> [input]");
          return;
        }
        const agentId = args[1];
        const inputData = args.length > 2 ? JSON.parse(args[2]) : {};
        await cli.runAgent(agentId, inputData);
        break;

      case "list":
        cli.listAgents();
        break;

      case "history":
        cli.showHistory();
        break;

      case "save":
        const saveFile = args[1] || "fractal_system_state.json";
        cli.saveState(saveFile);
        break;

      case "load":
        const loadFile = args[1] || "fractal_system_state.json";
        cli.loadState(loadFile);
        break;

      case "help":
        cli.showHelp();
        break;

      case "deploy":
        if (args.length < 2) {
          console.log("❌ Usage: deploy <workflow_file>");
          return;
        }
        const workflowFile = args[1];
        if (!fs.existsSync(workflowFile)) {
          console.log(`❌ File not found: ${workflowFile}`);
          return;
        }
        const workflow = JSON.parse(fs.readFileSync(workflowFile, "utf8"));
        const workflowName = path.basename(workflowFile, ".json");
        await cli.deployWorkflow(workflow, workflowName);
        break;

      default:
        console.log(`❌ Unknown command: ${command}`);
        cli.showHelp();
    }
  } catch (error) {
    console.error(`❌ Error: ${error.message}`);
  }

  // Save state before exiting
  cli.saveState();
}

// Run the CLI
if (require.main === module) {
  main().catch(console.error);
}

module.exports = FractalAgentCLI;
