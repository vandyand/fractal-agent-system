#!/usr/bin/env node

const FractalAgentCLI = require("./fractal_agent_cli");
const fs = require("fs");
const path = require("path");
const EventEmitter = require("events");

class AgentCommunicationProtocol extends EventEmitter {
  constructor() {
    super();
    this.cli = new FractalAgentCLI();
    this.messageQueue = [];
    this.agentRegistry = new Map();
    this.clusters = new Map();
    this.messageHistory = [];
    this.dataDir = "./agent_communications";

    // Initialize data directory
    if (!fs.existsSync(this.dataDir)) {
      fs.mkdirSync(this.dataDir, { recursive: true });
    }

    // Message types
    this.messageTypes = {
      REQUEST: "request",
      RESPONSE: "response",
      BROADCAST: "broadcast",
      HEARTBEAT: "heartbeat",
      TASK_ASSIGNMENT: "task_assignment",
      RESULT_DELIVERY: "result_delivery",
    };
  }

  async init() {
    console.log("🤖 AGENT COMMUNICATION PROTOCOL");
    console.log("===============================\n");

    await this.cli.init();
    this.cli.loadState();

    // Register existing agents
    this.registerExistingAgents();

    console.log("✅ Communication protocol initialized");
    console.log(`📊 Registered agents: ${this.agentRegistry.size}`);
    console.log(`🔄 Active clusters: ${this.clusters.size}`);
  }

  // Register existing agents from CLI state
  registerExistingAgents() {
    const agents = Array.from(this.cli.deployedAgents.entries());

    agents.forEach(([agentId, agent]) => {
      this.agentRegistry.set(agentId, {
        id: agentId,
        type: agent.type,
        capabilities: agent.capabilities || [],
        status: "active",
        lastHeartbeat: new Date().toISOString(),
        messageCount: 0,
        clusterId: null,
      });
    });

    console.log(`📝 Registered ${agents.length} existing agents`);
  }

  // Create a real message between agents
  createMessage(from, to, messageType, payload, correlationId = null) {
    const message = {
      id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      from,
      to,
      messageType,
      payload,
      timestamp: new Date().toISOString(),
      correlationId: correlationId || `corr_${Date.now()}`,
      status: "pending",
    };

    // Store message in history
    this.messageHistory.push(message);

    // Save to file
    this.saveMessageHistory();

    console.log(`📨 Message created: ${from} → ${to} (${messageType})`);
    return message;
  }

  // Send message between agents
  async sendMessage(message) {
    console.log(`🚀 Sending message: ${message.id}`);

    try {
      // Update message status
      message.status = "sent";
      message.sentAt = new Date().toISOString();

      // Update agent message count
      if (this.agentRegistry.has(message.from)) {
        this.agentRegistry.get(message.from).messageCount++;
      }

      // Emit message event
      this.emit("messageSent", message);

      // Process message based on type
      await this.processMessage(message);

      return { success: true, messageId: message.id };
    } catch (error) {
      message.status = "failed";
      message.error = error.message;
      console.error(`❌ Message send failed: ${error.message}`);
      return { success: false, error: error.message };
    }
  }

  // Process incoming messages
  async processMessage(message) {
    console.log(`🔄 Processing message: ${message.messageType}`);

    switch (message.messageType) {
      case this.messageTypes.REQUEST:
        await this.handleRequest(message);
        break;
      case this.messageTypes.RESPONSE:
        await this.handleResponse(message);
        break;
      case this.messageTypes.BROADCAST:
        await this.handleBroadcast(message);
        break;
      case this.messageTypes.TASK_ASSIGNMENT:
        await this.handleTaskAssignment(message);
        break;
      case this.messageTypes.RESULT_DELIVERY:
        await this.handleResultDelivery(message);
        break;
      default:
        console.warn(`⚠️ Unknown message type: ${message.messageType}`);
    }
  }

  // Handle request messages
  async handleRequest(message) {
    console.log(`📋 Processing request: ${message.payload.task}`);

    // Find target agent
    const targetAgent = this.agentRegistry.get(message.to);
    if (!targetAgent) {
      console.error(`❌ Target agent not found: ${message.to}`);
      return;
    }

    // Execute the request on the target agent
    try {
      const result = await this.cli.runAgent(message.to, message.payload.data);

      // Create response message
      const response = this.createMessage(
        message.to,
        message.from,
        this.messageTypes.RESPONSE,
        {
          originalRequestId: message.id,
          task: message.payload.task,
          result: result,
          success: true,
        },
        message.correlationId
      );

      await this.sendMessage(response);
    } catch (error) {
      // Send error response
      const errorResponse = this.createMessage(
        message.to,
        message.from,
        this.messageTypes.RESPONSE,
        {
          originalRequestId: message.id,
          task: message.payload.task,
          error: error.message,
          success: false,
        },
        message.correlationId
      );

      await this.sendMessage(errorResponse);
    }
  }

  // Handle response messages
  async handleResponse(message) {
    console.log(
      `📤 Processing response for: ${message.payload.originalRequestId}`
    );

    // Update original message status
    const originalMessage = this.messageHistory.find(
      (m) => m.id === message.payload.originalRequestId
    );
    if (originalMessage) {
      originalMessage.status = message.payload.success ? "completed" : "failed";
      originalMessage.response = message.payload;
    }

    // Emit response event
    this.emit("responseReceived", message);
  }

  // Handle broadcast messages
  async handleBroadcast(message) {
    console.log(`📢 Processing broadcast: ${message.payload.topic}`);

    // Prevent infinite loops - only process broadcasts once
    if (message.payload.processed) {
      console.log(`⏭️  Broadcast already processed, skipping`);
      return;
    }

    // Mark as processed
    message.payload.processed = true;

    // Send to all agents in the same cluster or all agents
    const targetAgents = message.payload.targetCluster
      ? Array.from(this.agentRegistry.values()).filter(
          (a) => a.clusterId === message.payload.targetCluster
        )
      : Array.from(this.agentRegistry.values());

    console.log(`📤 Broadcasting to ${targetAgents.length} agents`);

    // Don't create new broadcast messages - just log the broadcast
    for (const agent of targetAgents) {
      if (agent.id !== message.from) {
        console.log(`   📨 → ${agent.id}: ${message.payload.message}`);
      }
    }
  }

  // Handle task assignments
  async handleTaskAssignment(message) {
    console.log(`📋 Processing task assignment: ${message.payload.taskId}`);

    const targetAgent = this.agentRegistry.get(message.to);
    if (!targetAgent) {
      console.error(`❌ Target agent not found: ${message.to}`);
      return;
    }

    // Execute the assigned task
    try {
      const result = await this.cli.runAgent(
        message.to,
        message.payload.taskData
      );

      // Deliver result
      const resultMessage = this.createMessage(
        message.to,
        message.from,
        this.messageTypes.RESULT_DELIVERY,
        {
          taskId: message.payload.taskId,
          result: result,
          success: true,
          completedAt: new Date().toISOString(),
        },
        message.correlationId
      );

      await this.sendMessage(resultMessage);
    } catch (error) {
      // Deliver error result
      const errorResult = this.createMessage(
        message.to,
        message.from,
        this.messageTypes.RESULT_DELIVERY,
        {
          taskId: message.payload.taskId,
          error: error.message,
          success: false,
          completedAt: new Date().toISOString(),
        },
        message.correlationId
      );

      await this.sendMessage(errorResult);
    }
  }

  // Handle result delivery
  async handleResultDelivery(message) {
    console.log(`📦 Processing result delivery: ${message.payload.taskId}`);

    // Emit result event
    this.emit("resultDelivered", message);

    // Update task tracking
    this.updateTaskTracking(message);
  }

  // Create agent clusters
  createCluster(clusterId, agentIds, workflow = "sequential") {
    const cluster = {
      id: clusterId,
      agents: agentIds,
      workflow,
      status: "active",
      createdAt: new Date().toISOString(),
      messageCount: 0,
      loadBalancer: "round_robin",
      currentAgentIndex: 0,
    };

    this.clusters.set(clusterId, cluster);

    // Assign agents to cluster
    agentIds.forEach((agentId) => {
      if (this.agentRegistry.has(agentId)) {
        this.agentRegistry.get(agentId).clusterId = clusterId;
      }
    });

    console.log(
      `🔄 Created cluster: ${clusterId} with ${agentIds.length} agents`
    );
    return cluster;
  }

  // Send message to cluster
  async sendToCluster(clusterId, messageType, payload) {
    const cluster = this.clusters.get(clusterId);
    if (!cluster) {
      throw new Error(`Cluster not found: ${clusterId}`);
    }

    // Round-robin load balancing
    const targetAgentId = cluster.agents[cluster.currentAgentIndex];
    cluster.currentAgentIndex =
      (cluster.currentAgentIndex + 1) % cluster.agents.length;
    cluster.messageCount++;

    const message = this.createMessage(
      "cluster_manager",
      targetAgentId,
      messageType,
      payload
    );

    return await this.sendMessage(message);
  }

  // Save message history to file
  saveMessageHistory() {
    const historyFile = path.join(this.dataDir, "message_history.json");
    fs.writeFileSync(historyFile, JSON.stringify(this.messageHistory, null, 2));
  }

  // Update task tracking
  updateTaskTracking(message) {
    const trackingFile = path.join(this.dataDir, "task_tracking.json");
    let tracking = {};

    if (fs.existsSync(trackingFile)) {
      tracking = JSON.parse(fs.readFileSync(trackingFile, "utf8"));
    }

    const taskId = message.payload.taskId;
    tracking[taskId] = {
      status: message.payload.success ? "completed" : "failed",
      result: message.payload,
      completedAt: message.payload.completedAt,
      assignedTo: message.from,
      completedBy: message.to,
    };

    fs.writeFileSync(trackingFile, JSON.stringify(tracking, null, 2));
  }

  // Get communication statistics
  getCommunicationStats() {
    const stats = {
      totalMessages: this.messageHistory.length,
      agents: this.agentRegistry.size,
      clusters: this.clusters.size,
      messageTypes: {},
      agentActivity: {},
      clusterActivity: {},
    };

    // Count message types
    this.messageHistory.forEach((msg) => {
      stats.messageTypes[msg.messageType] =
        (stats.messageTypes[msg.messageType] || 0) + 1;
    });

    // Agent activity
    Array.from(this.agentRegistry.values()).forEach((agent) => {
      stats.agentActivity[agent.id] = {
        messageCount: agent.messageCount,
        status: agent.status,
        clusterId: agent.clusterId,
      };
    });

    // Cluster activity
    Array.from(this.clusters.values()).forEach((cluster) => {
      stats.clusterActivity[cluster.id] = {
        messageCount: cluster.messageCount,
        agentCount: cluster.agents.length,
        status: cluster.status,
      };
    });

    return stats;
  }

  // Run communication test
  async runCommunicationTest() {
    console.log("\n🧪 RUNNING COMMUNICATION PROTOCOL TEST");
    console.log("=====================================\n");

    // Get available agents
    const agents = Array.from(this.agentRegistry.keys());
    if (agents.length < 2) {
      console.log("❌ Need at least 2 agents for communication test");
      return;
    }

    const [agent1, agent2] = agents;

    // Test 1: Direct request/response
    console.log("📨 Test 1: Direct agent communication");
    const request = this.createMessage(
      agent1,
      agent2,
      this.messageTypes.REQUEST,
      {
        task: "test_communication",
        data: { message: "Hello from agent 1!" },
      }
    );

    await this.sendMessage(request);

    // Test 2: Task assignment
    console.log("\n📋 Test 2: Task assignment");
    const taskAssignment = this.createMessage(
      "task_manager",
      agent1,
      this.messageTypes.TASK_ASSIGNMENT,
      {
        taskId: "test_task_001",
        taskData: { operation: "test_operation", input: "test_input" },
      }
    );

    await this.sendMessage(taskAssignment);

    // Test 3: Broadcast
    console.log("\n📢 Test 3: Broadcast message");
    const broadcast = this.createMessage(
      agent1,
      "all",
      this.messageTypes.BROADCAST,
      {
        topic: "system_announcement",
        message: "Communication protocol is working!",
        targetCluster: null,
      }
    );

    await this.sendMessage(broadcast);

    // Show results
    console.log("\n📊 Communication Test Results:");
    console.log("==============================");
    const stats = this.getCommunicationStats();
    console.log(`📨 Total Messages: ${stats.totalMessages}`);
    console.log(`🤖 Active Agents: ${stats.agents}`);
    console.log(`🔄 Active Clusters: ${stats.clusters}`);

    console.log("\n📈 Message Types:");
    Object.entries(stats.messageTypes).forEach(([type, count]) => {
      console.log(`   ${type}: ${count}`);
    });

    console.log("\n✅ Communication protocol test completed!");
  }
}

// Run communication protocol
async function main() {
  const protocol = new AgentCommunicationProtocol();
  await protocol.init();
  await protocol.runCommunicationTest();
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = { AgentCommunicationProtocol };
