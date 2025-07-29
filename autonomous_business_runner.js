#!/usr/bin/env node

const FractalAgentCLI = require("./fractal_agent_cli");

class AutonomousBusinessRunner {
  constructor() {
    this.cli = new FractalAgentCLI();
    this.isRunning = false;
    this.taskQueue = [];
    this.completedTasks = [];
    this.businessMetrics = {
      tasksCompleted: 0,
      agentsSpawned: 0,
      workflowsDeployed: 0,
      startTime: null,
      totalRevenue: 0,
      customerSatisfaction: 0,
    };
  }

  // Initialize the autonomous business system
  async init() {
    console.log("🏢 Autonomous Business System - Infinite Loop Runner");
    console.log("===================================================\n");

    await this.cli.init();
    this.cli.loadState();

    // Initialize business metrics
    this.businessMetrics.startTime = new Date().toISOString();

    console.log("✅ Business system initialized");
    console.log("🔄 Starting infinite loop with business tasks...\n");
  }

  // Generate business tasks
  generateBusinessTasks() {
    const tasks = [
      {
        id: `task_${Date.now()}`,
        type: "customer_support",
        description: "Process customer inquiry about order status",
        priority: "high",
        input: {
          customer_email: "customer@example.com",
          order_id: "ORD-12345",
          inquiry: "Where is my order? It was supposed to arrive yesterday.",
        },
        expectedOutcome: "Order status response with tracking information",
      },
      {
        id: `task_${Date.now() + 1}`,
        type: "inventory_management",
        description: "Check inventory levels and reorder if needed",
        priority: "medium",
        input: {
          product_id: "PROD-789",
          current_stock: 15,
          reorder_threshold: 20,
          supplier_info: "supplier@example.com",
        },
        expectedOutcome: "Inventory report and reorder notification if needed",
      },
      {
        id: `task_${Date.now() + 2}`,
        type: "marketing_analysis",
        description: "Analyze customer feedback for product improvement",
        priority: "medium",
        input: {
          feedback_data: [
            "Great product, but shipping was slow",
            "Love the quality, will buy again",
            "Product arrived damaged, need replacement",
            "Excellent customer service experience",
          ],
        },
        expectedOutcome: "Sentiment analysis and improvement recommendations",
      },
      {
        id: `task_${Date.now() + 3}`,
        type: "financial_reporting",
        description: "Generate daily sales report",
        priority: "low",
        input: {
          sales_data: [
            { product: "Widget A", quantity: 5, revenue: 250 },
            { product: "Widget B", quantity: 3, revenue: 180 },
            { product: "Widget C", quantity: 8, revenue: 400 },
          ],
        },
        expectedOutcome: "Daily sales summary with revenue calculations",
      },
      {
        id: `task_${Date.now() + 4}`,
        type: "workflow_optimization",
        description: "Create automated workflow for order processing",
        priority: "high",
        input: {
          process_description:
            "Automate order processing from receipt to shipping confirmation",
        },
        expectedOutcome: "Complete Node-RED workflow for order automation",
      },
    ];

    return tasks;
  }

  // Spawn specialized agents for business tasks
  async spawnBusinessAgents() {
    const businessAgents = [
      {
        type: "customer_support_agent",
        capabilities: [
          "email_processing",
          "order_tracking",
          "response_generation",
        ],
        description: "Handles customer inquiries and support requests",
      },
      {
        type: "inventory_agent",
        capabilities: [
          "stock_monitoring",
          "reorder_management",
          "supplier_communication",
        ],
        description: "Manages inventory levels and supplier relationships",
      },
      {
        type: "analytics_agent",
        capabilities: ["data_analysis", "sentiment_analysis", "reporting"],
        description: "Analyzes data and generates business insights",
      },
      {
        type: "financial_agent",
        capabilities: ["revenue_tracking", "reporting", "financial_analysis"],
        description: "Handles financial reporting and analysis",
      },
      {
        type: "automation_agent",
        capabilities: [
          "workflow_generation",
          "process_optimization",
          "system_integration",
        ],
        description: "Creates and optimizes business workflows",
      },
    ];

    const spawnedAgents = [];

    for (const agentConfig of businessAgents) {
      try {
        const agentId = await this.cli.spawnAgent(
          agentConfig.type,
          agentConfig.capabilities
        );
        spawnedAgents.push({
          id: agentId,
          type: agentConfig.type,
          capabilities: agentConfig.capabilities,
          description: agentConfig.description,
        });
        this.businessMetrics.agentsSpawned++;
        console.log(`🤖 Spawned ${agentConfig.type}: ${agentId}`);
      } catch (error) {
        console.error(
          `❌ Failed to spawn ${agentConfig.type}: ${error.message}`
        );
      }
    }

    return spawnedAgents;
  }

  // Execute a business task
  async executeTask(task, agents) {
    console.log(`\n📋 Executing Task: ${task.description}`);
    console.log(`   Type: ${task.type}`);
    console.log(`   Priority: ${task.priority}`);
    console.log(`   Expected: ${task.expectedOutcome}`);

    try {
      // Find appropriate agent for the task
      const appropriateAgent = agents.find(
        (agent) =>
          agent.type.includes(task.type.split("_")[0]) ||
          agent.capabilities.some((cap) =>
            task.type.includes(cap.split("_")[0])
          )
      );

      if (!appropriateAgent) {
        console.log(`⚠️  No specific agent found for task type: ${task.type}`);
        // Use a general workflow generator agent
        const generalAgent = agents.find(
          (agent) => agent.type === "automation_agent"
        );
        if (generalAgent) {
          await this.cli.runAgent(generalAgent.id, {
            request: `Create a workflow to handle: ${task.description}`,
            input_data: task.input,
          });
        }
      } else {
        // Run the appropriate agent
        await this.cli.runAgent(appropriateAgent.id, task.input);
      }

      // Simulate task completion and business impact
      const taskResult = {
        taskId: task.id,
        completedAt: new Date().toISOString(),
        success: true,
        businessImpact: this.calculateBusinessImpact(task),
      };

      this.completedTasks.push(taskResult);
      this.businessMetrics.tasksCompleted++;
      this.businessMetrics.totalRevenue += taskResult.businessImpact.revenue;
      this.businessMetrics.customerSatisfaction +=
        taskResult.businessImpact.satisfaction;

      console.log(`✅ Task completed successfully`);
      console.log(`   Revenue Impact: $${taskResult.businessImpact.revenue}`);
      console.log(
        `   Satisfaction Impact: +${taskResult.businessImpact.satisfaction}%`
      );
    } catch (error) {
      console.error(`❌ Task execution failed: ${error.message}`);

      const taskResult = {
        taskId: task.id,
        completedAt: new Date().toISOString(),
        success: false,
        error: error.message,
        businessImpact: { revenue: 0, satisfaction: -5 },
      };

      this.completedTasks.push(taskResult);
      this.businessMetrics.customerSatisfaction -= 5;
    }
  }

  // Calculate business impact of completed task
  calculateBusinessImpact(task) {
    const impactMap = {
      customer_support: { revenue: 50, satisfaction: 10 },
      inventory_management: { revenue: 100, satisfaction: 5 },
      marketing_analysis: { revenue: 75, satisfaction: 8 },
      financial_reporting: { revenue: 25, satisfaction: 2 },
      workflow_optimization: { revenue: 200, satisfaction: 15 },
    };

    return impactMap[task.type] || { revenue: 25, satisfaction: 5 };
  }

  // Display business metrics
  displayMetrics() {
    const runtime = new Date() - new Date(this.businessMetrics.startTime);
    const runtimeMinutes = Math.floor(runtime / 60000);

    console.log("\n📊 Business Metrics Dashboard");
    console.log("============================");
    console.log(`⏱️  Runtime: ${runtimeMinutes} minutes`);
    console.log(`📋 Tasks Completed: ${this.businessMetrics.tasksCompleted}`);
    console.log(`🤖 Agents Spawned: ${this.businessMetrics.agentsSpawned}`);
    console.log(
      `📦 Workflows Deployed: ${this.businessMetrics.workflowsDeployed}`
    );
    console.log(`💰 Total Revenue: $${this.businessMetrics.totalRevenue}`);
    console.log(
      `😊 Customer Satisfaction: ${this.businessMetrics.customerSatisfaction}%`
    );

    if (this.completedTasks.length > 0) {
      const successRate =
        (this.completedTasks.filter((t) => t.success).length /
          this.completedTasks.length) *
        100;
      console.log(`✅ Success Rate: ${successRate.toFixed(1)}%`);
    }

    // Calculate efficiency metrics
    if (runtimeMinutes > 0) {
      const tasksPerMinute =
        this.businessMetrics.tasksCompleted / runtimeMinutes;
      const revenuePerMinute =
        this.businessMetrics.totalRevenue / runtimeMinutes;
      console.log(`⚡ Tasks/Minute: ${tasksPerMinute.toFixed(2)}`);
      console.log(`💵 Revenue/Minute: $${revenuePerMinute.toFixed(2)}`);
    }
  }

  // Run the autonomous business system
  async run() {
    await this.init();
    this.isRunning = true;

    // Spawn initial business agents
    console.log("🤖 Spawning Business Agents...");
    const agents = await this.spawnBusinessAgents();
    console.log(`✅ Spawned ${agents.length} business agents\n`);

    let iteration = 1;

    while (this.isRunning) {
      console.log(`\n🔄 Business Iteration ${iteration}`);
      console.log("================================");

      try {
        // Generate new tasks
        const tasks = this.generateBusinessTasks();
        console.log(`📋 Generated ${tasks.length} new business tasks`);

        // Execute tasks
        for (const task of tasks) {
          await this.executeTask(task, agents);

          // Small delay between tasks
          await new Promise((resolve) => setTimeout(resolve, 2000));
        }

        // Display metrics every 5 iterations
        if (iteration % 5 === 0) {
          this.displayMetrics();

          // Save system state
          this.cli.saveState(`business_state_iteration_${iteration}.json`);
        }

        // Check if we should spawn new agents (every 10 iterations)
        if (iteration % 10 === 0) {
          console.log("\n🔄 Spawning additional agents for scaling...");
          const newAgents = await this.spawnBusinessAgents();
          agents.push(...newAgents);
        }

        // Check if we should create new workflows (every 15 iterations)
        if (iteration % 15 === 0) {
          console.log("\n🔄 Creating new workflows for optimization...");
          const automationAgent = agents.find(
            (a) => a.type === "automation_agent"
          );
          if (automationAgent) {
            await this.cli.runAgent(automationAgent.id, {
              request:
                "Create optimized workflows for current business processes",
              current_metrics: this.businessMetrics,
            });
            this.businessMetrics.workflowsDeployed++;
          }
        }

        iteration++;

        // Wait before next iteration
        console.log("\n⏳ Waiting 10 seconds before next iteration...");
        await new Promise((resolve) => setTimeout(resolve, 10000));
      } catch (error) {
        console.error(`❌ Iteration ${iteration} failed: ${error.message}`);

        // Continue running despite errors
        await new Promise((resolve) => setTimeout(resolve, 5000));
        iteration++;
      }
    }
  }

  // Stop the autonomous system
  stop() {
    console.log("\n🛑 Stopping autonomous business system...");
    this.isRunning = false;
    this.displayMetrics();
    this.cli.saveState("final_business_state.json");
    console.log("✅ System stopped and state saved");
  }
}

// CLI interface for the autonomous business runner
async function main() {
  const runner = new AutonomousBusinessRunner();

  // Handle graceful shutdown
  process.on("SIGINT", () => {
    console.log("\n🛑 Received SIGINT, shutting down gracefully...");
    runner.stop();
    process.exit(0);
  });

  process.on("SIGTERM", () => {
    console.log("\n🛑 Received SIGTERM, shutting down gracefully...");
    runner.stop();
    process.exit(0);
  });

  // Parse command line arguments
  const args = process.argv.slice(2);

  if (args.includes("--help") || args.includes("-h")) {
    console.log("🏢 Autonomous Business Runner");
    console.log("============================");
    console.log("Usage: node autonomous_business_runner.js [options]");
    console.log("");
    console.log("Options:");
    console.log("  --help, -h     Show this help message");
    console.log("  --metrics      Show current metrics and exit");
    console.log("  --state        Show current state and exit");
    console.log("");
    console.log("The system will run indefinitely until interrupted.");
    return;
  }

  if (args.includes("--metrics")) {
    await runner.init();
    runner.displayMetrics();
    return;
  }

  if (args.includes("--state")) {
    await runner.init();
    runner.cli.listAgents();
    runner.cli.showHistory();
    return;
  }

  // Start the autonomous business system
  console.log("🚀 Starting Autonomous Business System...");
  console.log("Press Ctrl+C to stop the system\n");

  await runner.run();
}

// Run the autonomous business system
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { AutonomousBusinessRunner };
