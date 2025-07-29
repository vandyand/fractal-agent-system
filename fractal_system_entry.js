#!/usr/bin/env node

const { SimpleTaskManager } = require("./simple_task_manager");
const { EnhancedAgentCommunication } = require("./enhanced_agent_communication");
const FractalAgentCLI = require("./fractal_agent_cli");
const fs = require("fs");
const path = require("path");

class FractalSystemEntry {
  constructor() {
    this.taskManager = new SimpleTaskManager();
    this.enhancedComm = new EnhancedAgentCommunication();
    this.cli = new FractalAgentCLI();
    this.systemStatus = "stopped";
    this.startTime = null;
    this.dataDir = "./system_data";

    // Initialize data directory
    if (!fs.existsSync(this.dataDir)) {
      fs.mkdirSync(this.dataDir, { recursive: true });
    }

    // System components
    this.components = {
      taskManager: { status: "stopped", lastActivity: null },
      enhancedComm: { status: "stopped", lastActivity: null },
      nodeRed: { status: "stopped", port: 1880, url: "http://localhost:1880" },
      agents: { count: 0, active: 0 },
    };

    // Standardized workflows for verification
    this.verificationWorkflows = {
      system_health: {
        name: "System Health Check",
        description: "Verify all system components are working",
        steps: [
          { step: 1, component: "node_red", action: "check_connectivity" },
          { step: 2, component: "agents", action: "verify_agents" },
          { step: 3, component: "task_manager", action: "test_task_creation" },
          { step: 4, component: "enhanced_comm", action: "test_communication" },
        ],
      },
      functionality_test: {
        name: "New Functionality Test",
        description: "Test newly added functionality",
        steps: [
          { step: 1, component: "task_manager", action: "create_test_task" },
          { step: 2, component: "enhanced_comm", action: "run_test_workflow" },
          { step: 3, component: "agents", action: "execute_test_agents" },
          { step: 4, component: "system", action: "verify_results" },
        ],
      },
    };
  }

  async init() {
    console.log("🚀 FRACTAL AGENT SYSTEM - MAIN ENTRY POINT");
    console.log("==========================================\n");

    try {
      // Initialize all components
      await this.initializeComponents();

      // Load system state
      this.loadSystemState();

      // Verify system health
      await this.verifySystemHealth();

      console.log("✅ Fractal system initialized successfully");
      this.systemStatus = "ready";
    } catch (error) {
      console.error("❌ System initialization failed:", error.message);
      this.systemStatus = "error";
      throw error;
    }
  }

  async initializeComponents() {
    console.log("🔧 Initializing system components...");

    // Initialize CLI
    await this.cli.init();
    this.cli.loadState();
    this.components.agents.count = this.cli.deployedAgents.size;
    this.components.agents.active = this.cli.deployedAgents.size;

    // Initialize task manager
    await this.taskManager.init();
    this.components.taskManager.status = "ready";
    this.components.taskManager.lastActivity = new Date().toISOString();

    // Initialize enhanced communication
    await this.enhancedComm.init();
    this.components.enhancedComm.status = "ready";
    this.components.enhancedComm.lastActivity = new Date().toISOString();

    // Check Node-RED status
    await this.checkNodeRedStatus();

    console.log("✅ All components initialized");
  }

  async checkNodeRedStatus() {
    try {
      const response = await fetch(this.components.nodeRed.url);
      if (response.ok) {
        this.components.nodeRed.status = "running";
        console.log("✅ Node-RED is running");
      } else {
        this.components.nodeRed.status = "error";
        console.log("⚠️ Node-RED responded with error");
      }
    } catch (error) {
      this.components.nodeRed.status = "stopped";
      console.log("❌ Node-RED is not running");
    }
  }

  async verifySystemHealth() {
    console.log("\n🏥 Running system health check...");

    const healthCheck = await this.runVerificationWorkflow("system_health");

    if (healthCheck.success) {
      console.log("✅ System health check passed");
    } else {
      console.log("❌ System health check failed");
      throw new Error("System health check failed");
    }
  }

  async runVerificationWorkflow(workflowType) {
    const workflow = this.verificationWorkflows[workflowType];
    if (!workflow) {
      throw new Error(`Verification workflow not found: ${workflowType}`);
    }

    console.log(`\n🔍 Running verification: ${workflow.name}`);
    console.log(`📋 Steps: ${workflow.steps.length}`);

    const results = {
      workflowType,
      workflowName: workflow.name,
      steps: [],
      success: true,
      startTime: new Date().toISOString(),
      endTime: null,
    };

    for (const step of workflow.steps) {
      console.log(`\n🔄 Step ${step.step}: ${step.action} (${step.component})`);

      try {
        const stepResult = await this.executeVerificationStep(step);
        results.steps.push({
          step: step.step,
          component: step.component,
          action: step.action,
          success: true,
          result: stepResult,
          timestamp: new Date().toISOString(),
        });
        console.log(`✅ Step ${step.step} completed`);
      } catch (error) {
        console.error(`❌ Step ${step.step} failed: ${error.message}`);
        results.steps.push({
          step: step.step,
          component: step.component,
          action: step.action,
          success: false,
          error: error.message,
          timestamp: new Date().toISOString(),
        });
        results.success = false;
      }
    }

    results.endTime = new Date().toISOString();
    results.duration = new Date(results.endTime) - new Date(results.startTime);

    // Save verification results
    this.saveVerificationResults(results);

    return results;
  }

  async executeVerificationStep(step) {
    switch (step.component) {
      case "node_red":
        return await this.verifyNodeRed(step.action);
      case "agents":
        return await this.verifyAgents(step.action);
      case "task_manager":
        return await this.verifyTaskManager(step.action);
      case "enhanced_comm":
        return await this.verifyEnhancedComm(step.action);
      case "system":
        return await this.verifySystem(step.action);
      default:
        throw new Error(`Unknown component: ${step.component}`);
    }
  }

  async verifyNodeRed(action) {
    switch (action) {
      case "check_connectivity":
        const response = await fetch(this.components.nodeRed.url);
        return {
          status: response.status,
          ok: response.ok,
          url: this.components.nodeRed.url,
        };
      default:
        throw new Error(`Unknown Node-RED action: ${action}`);
    }
  }

  async verifyAgents(action) {
    switch (action) {
      case "verify_agents":
        const agents = Array.from(this.cli.deployedAgents.entries());
        return {
          totalAgents: agents.length,
          agentTypes: [...new Set(agents.map(([id, agent]) => agent.type))],
          activeAgents: agents.filter(
            ([id, agent]) => agent.status === "active"
          ).length,
        };
      case "execute_test_agents":
        // Test agent execution
        const testAgent = Array.from(this.cli.deployedAgents.entries())[0];
        if (testAgent) {
          const [agentId, agent] = testAgent;
          const result = await this.cli.runAgent(agentId, {
            action: "test_execution",
            input: { test: true },
            timestamp: new Date().toISOString(),
          });
          return { agentId, result };
        }
        throw new Error("No agents available for testing");
      default:
        throw new Error(`Unknown agents action: ${action}`);
    }
  }

  async verifyTaskManager(action) {
    switch (action) {
      case "test_task_creation":
        const testTask = this.taskManager.createTask(
          "content_creation",
          {
            topic: "System Verification Test",
            targetAudience: "system",
            contentType: "blog_post",
            wordCount: 100,
          },
          "low",
          { createdBy: "system_verification" }
        );
        return { taskId: testTask.id, status: testTask.status };
      default:
        throw new Error(`Unknown task manager action: ${action}`);
    }
  }

  async verifyEnhancedComm(action) {
    switch (action) {
      case "test_communication":
        const stats = this.enhancedComm.getEnhancedStats();
        return {
          totalMessages: stats.totalMessages,
          agents: stats.agents,
          workflows: stats.workflows,
        };
      case "run_test_workflow":
        const testWorkflow = await this.enhancedComm.startCollaborativeWorkflow(
          "content_creation",
          {
            topic: "Communication Test",
            targetAudience: "test",
            contentType: "blog_post",
            wordCount: 50,
          }
        );
        return { workflowId: testWorkflow.id, status: testWorkflow.status };
      default:
        throw new Error(`Unknown enhanced comm action: ${action}`);
    }
  }

  async verifySystem(action) {
    switch (action) {
      case "verify_results":
        return {
          systemStatus: this.systemStatus,
          components: this.components,
          startTime: this.startTime,
        };
      default:
        throw new Error(`Unknown system action: ${action}`);
    }
  }

  // Main system operations
  async startSystem() {
    console.log("\n🚀 Starting Fractal Agent System...");

    this.startTime = new Date().toISOString();
    this.systemStatus = "running";

    // Run initial verification
    await this.verifySystemHealth();

    console.log("✅ System started successfully");
    this.saveSystemState();
  }

  async stopSystem() {
    console.log("\n🛑 Stopping Fractal Agent System...");

    this.systemStatus = "stopped";

    // Save final state
    this.saveSystemState();

    console.log("✅ System stopped");
  }

  async testNewFunctionality(functionalityName, testData = {}) {
    console.log(`\n🧪 Testing new functionality: ${functionalityName}`);

    // Run functionality test workflow
    const testResults = await this.runVerificationWorkflow(
      "functionality_test"
    );

    // Add custom test data
    testResults.functionalityName = functionalityName;
    testResults.customTestData = testData;

    console.log(
      `✅ Functionality test completed: ${
        testResults.success ? "PASSED" : "FAILED"
      }`
    );

    return testResults;
  }

  async runWorkflow(workflowType, inputData, priority = "medium") {
    console.log(`\n🔄 Running workflow: ${workflowType}`);

    // Create and execute task
    const task = this.taskManager.createTask(workflowType, inputData, priority);
    const result = await this.taskManager.executeTask(task.id);

    console.log(`✅ Workflow completed: ${task.id}`);

    return result;
  }

  async getSystemStatus() {
    return {
      systemStatus: this.systemStatus,
      startTime: this.startTime,
      components: this.components,
      taskStats: this.taskManager.getTaskStatistics(),
      commStats: this.enhancedComm.getEnhancedStats(),
    };
  }

  // Data persistence
  saveSystemState() {
    const state = {
      systemStatus: this.systemStatus,
      startTime: this.startTime,
      components: this.components,
      timestamp: new Date().toISOString(),
    };

    const stateFile = path.join(this.dataDir, "system_state.json");
    fs.writeFileSync(stateFile, JSON.stringify(state, null, 2));
  }

  loadSystemState() {
    const stateFile = path.join(this.dataDir, "system_state.json");

    if (fs.existsSync(stateFile)) {
      const state = JSON.parse(fs.readFileSync(stateFile, "utf8"));
      this.systemStatus = state.systemStatus || "stopped";
      this.startTime = state.startTime;
      this.components = state.components || this.components;
    }
  }

  saveVerificationResults(results) {
    const resultsFile = path.join(
      this.dataDir,
      `verification_${Date.now()}.json`
    );
    fs.writeFileSync(resultsFile, JSON.stringify(results, null, 2));
  }

  // Main demo function
  async runSystemDemo() {
    console.log("\n🎬 FRACTAL SYSTEM DEMO");
    console.log("=====================\n");

    // Start system
    await this.startSystem();

    // Run sample workflows
    console.log("\n📝 Running Content Creation Workflow...");
    await this.runWorkflow("content_creation", {
      topic: "AI-Powered Task Management",
      targetAudience: "developers",
      contentType: "blog_post",
      wordCount: 800,
      tone: "technical",
    });

    console.log("\n📧 Running Customer Support Workflow...");
    await this.runWorkflow("customer_support", {
      customerEmail: "user@example.com",
      inquiry: "Help with system configuration",
      priority: "high",
      category: "technical",
    });

    // Test new functionality
    console.log("\n🧪 Testing new functionality...");
    await this.testNewFunctionality("enhanced_communication", {
      testType: "multi_agent_workflow",
      complexity: "medium",
    });

    // Show system status
    console.log("\n📊 System Status:");
    console.log("=================");
    const status = await this.getSystemStatus();
    console.log(`System Status: ${status.systemStatus}`);
    console.log(`Start Time: ${status.startTime}`);
    console.log(
      `Active Components: ${
        Object.values(status.components).filter(
          (c) => c.status === "ready" || c.status === "running"
        ).length
      }`
    );

    // Stop system
    await this.stopSystem();

    console.log("\n✅ System demo completed!");
  }
}

// Main entry point
async function main() {
  const system = new FractalSystemEntry();

  try {
    await system.init();
    await system.runSystemDemo();
  } catch (error) {
    console.error("❌ System error:", error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = { FractalSystemEntry };
 