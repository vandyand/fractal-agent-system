#!/usr/bin/env node

const FractalAgentCLI = require("./fractal_agent_cli");
const fs = require("fs");
const path = require("path");

class RealBusinessOperations {
  constructor() {
    this.cli = new FractalAgentCLI();
    this.dataDir = "./business_data";
    this.metricsFile = path.join(this.dataDir, "real_metrics.json");
    this.knowledgeBaseFile = path.join(this.dataDir, "knowledge_base.json");
    this.workflowsFile = path.join(this.dataDir, "deployed_workflows.json");

    // Initialize data directory
    if (!fs.existsSync(this.dataDir)) {
      fs.mkdirSync(this.dataDir, { recursive: true });
    }

    // Initialize data files
    this.initializeDataFiles();
  }

  initializeDataFiles() {
    const files = [
      {
        path: this.metricsFile,
        default: {
          totalRuns: 0,
          successfulRuns: 0,
          failedRuns: 0,
          agents: {},
          workflows: {},
        },
      },
      {
        path: this.knowledgeBaseFile,
        default: { interactions: [], insights: [], patterns: [] },
      },
      {
        path: this.workflowsFile,
        default: { deployed: [], templates: [], performance: {} },
      },
    ];

    files.forEach((file) => {
      if (!fs.existsSync(file.path)) {
        fs.writeFileSync(file.path, JSON.stringify(file.default, null, 2));
      }
    });
  }

  async init() {
    console.log("🏢 REAL BUSINESS OPERATIONS SYSTEM");
    console.log("===================================\n");

    await this.cli.init();
    this.cli.loadState();

    console.log("✅ System initialized with real data tracking");
    console.log(`📊 Metrics file: ${this.metricsFile}`);
    console.log(`🧠 Knowledge base: ${this.knowledgeBaseFile}`);
    console.log(`🔄 Workflows: ${this.workflowsFile}\n`);
  }

  // Real metrics tracking
  async trackMetrics(agentId, operation, success, data = {}) {
    const metrics = JSON.parse(fs.readFileSync(this.metricsFile, "utf8"));

    metrics.totalRuns++;
    if (success) {
      metrics.successfulRuns++;
    } else {
      metrics.failedRuns++;
    }

    // Track agent performance
    if (!metrics.agents[agentId]) {
      metrics.agents[agentId] = {
        runs: 0,
        successes: 0,
        failures: 0,
        lastRun: null,
      };
    }

    metrics.agents[agentId].runs++;
    metrics.agents[agentId].lastRun = new Date().toISOString();

    if (success) {
      metrics.agents[agentId].successes++;
    } else {
      metrics.agents[agentId].failures++;
    }

    // Add operation data
    if (!metrics.operations) metrics.operations = [];
    metrics.operations.push({
      timestamp: new Date().toISOString(),
      agentId,
      operation,
      success,
      data,
    });

    fs.writeFileSync(this.metricsFile, JSON.stringify(metrics, null, 2));

    console.log(
      `📊 Metrics updated: ${operation} - ${success ? "SUCCESS" : "FAILED"}`
    );
  }

  // Knowledge base management
  async addToKnowledgeBase(interaction) {
    const kb = JSON.parse(fs.readFileSync(this.knowledgeBaseFile, "utf8"));

    kb.interactions.push({
      timestamp: new Date().toISOString(),
      ...interaction,
    });

    // Extract insights (simple pattern recognition)
    if (interaction.success && interaction.output) {
      kb.insights.push({
        timestamp: new Date().toISOString(),
        pattern: interaction.operation,
        successFactors: interaction.output,
        agentType: interaction.agentType,
      });
    }

    fs.writeFileSync(this.knowledgeBaseFile, JSON.stringify(kb, null, 2));
  }

  // Real document generation
  async generateBusinessDocument(type, data) {
    console.log(`📝 Generating ${type} document...`);

    const documentTemplates = {
      report: {
        title: "Business Operations Report",
        sections: [
          "Executive Summary",
          "Performance Metrics",
          "Key Insights",
          "Recommendations",
        ],
      },
      proposal: {
        title: "Business Proposal",
        sections: [
          "Problem Statement",
          "Solution Overview",
          "Implementation Plan",
          "Cost Analysis",
        ],
      },
      email: {
        title: "Business Communication",
        sections: [
          "Subject",
          "Greeting",
          "Body",
          "Call to Action",
          "Signature",
        ],
      },
    };

    const template = documentTemplates[type];
    if (!template) {
      throw new Error(`Unknown document type: ${type}`);
    }

    // Generate document using OpenAI
    const documentPrompt = `Generate a professional ${type} with the following data:
        ${JSON.stringify(data, null, 2)}
        
        Structure it with these sections: ${template.sections.join(", ")}
        
        Make it business-ready and professional.`;

    // For now, return the prompt (we'll implement OpenAI call later)
    return {
      type,
      title: template.title,
      content: documentPrompt,
      generatedAt: new Date().toISOString(),
      data,
    };
  }

  // Real workflow auto-deployment
  async deployGeneratedWorkflow(workflowJson, agentId) {
    console.log(`🔄 Auto-deploying generated workflow from agent: ${agentId}`);

    try {
      // Deploy the workflow
      const deploymentResult = await this.cli.deployWorkflow(
        workflowJson,
        `auto_deployed_${Date.now()}`
      );

      // Track the deployment
      const workflows = JSON.parse(fs.readFileSync(this.workflowsFile, "utf8"));
      workflows.deployed.push({
        id: deploymentResult.workflowName,
        agentId,
        deployedAt: new Date().toISOString(),
        workflow: workflowJson,
        status: "active",
      });

      fs.writeFileSync(this.workflowsFile, JSON.stringify(workflows, null, 2));

      console.log(
        `✅ Workflow auto-deployed successfully: ${deploymentResult.workflowName}`
      );
      return deploymentResult;
    } catch (error) {
      console.error(`❌ Workflow auto-deployment failed: ${error.message}`);
      throw error;
    }
  }

  // Real business task execution
  async executeRealBusinessTask(task) {
    console.log(`\n🎯 Executing REAL Business Task: ${task.type}`);
    console.log(`   Description: ${task.description}`);
    console.log(`   Priority: ${task.priority}`);

    const startTime = Date.now();

    try {
      // Find appropriate agent
      const agents = Array.from(this.cli.deployedAgents.entries());
      const appropriateAgent = agents.find(
        ([id, agent]) =>
          agent.type.includes(task.type.split("_")[0]) ||
          agent.capabilities.some((cap) =>
            task.type.includes(cap.split("_")[0])
          )
      );

      if (!appropriateAgent) {
        throw new Error(`No agent found for task type: ${task.type}`);
      }

      // Execute the task
      await this.cli.runAgent(appropriateAgent[0], task.input);

      const executionTime = Date.now() - startTime;

      // Track real metrics
      await this.trackMetrics(appropriateAgent[0], task.type, true, {
        executionTime,
        taskDescription: task.description,
        priority: task.priority,
      });

      // Add to knowledge base
      await this.addToKnowledgeBase({
        agentId: appropriateAgent[0],
        agentType: appropriateAgent[1].type,
        operation: task.type,
        input: task.input,
        success: true,
        executionTime,
        timestamp: new Date().toISOString(),
      });

      console.log(`✅ Task completed successfully in ${executionTime}ms`);

      // Generate real business document
      const document = await this.generateBusinessDocument("report", {
        task: task,
        agent: appropriateAgent[1],
        executionTime,
        status: "completed",
      });

      console.log(`📄 Generated business report: ${document.title}`);

      return {
        success: true,
        executionTime,
        agentId: appropriateAgent[0],
        document,
      };
    } catch (error) {
      const executionTime = Date.now() - startTime;

      // Track failure
      await this.trackMetrics("unknown", task.type, false, {
        executionTime,
        error: error.message,
        taskDescription: task.description,
      });

      console.error(`❌ Task failed: ${error.message}`);

      return {
        success: false,
        executionTime,
        error: error.message,
      };
    }
  }

  // Show real business metrics
  showRealMetrics() {
    const metrics = JSON.parse(fs.readFileSync(this.metricsFile, "utf8"));
    const kb = JSON.parse(fs.readFileSync(this.knowledgeBaseFile, "utf8"));
    const workflows = JSON.parse(fs.readFileSync(this.workflowsFile, "utf8"));

    console.log("\n📊 REAL BUSINESS METRICS");
    console.log("========================");
    console.log(`📈 Total Operations: ${metrics.totalRuns}`);
    console.log(`✅ Successful: ${metrics.successfulRuns}`);
    console.log(`❌ Failed: ${metrics.failedRuns}`);
    console.log(
      `📊 Success Rate: ${(
        (metrics.successfulRuns / metrics.totalRuns) *
        100
      ).toFixed(1)}%`
    );

    console.log("\n🤖 Agent Performance:");
    Object.entries(metrics.agents).forEach(([agentId, data]) => {
      const successRate = ((data.successes / data.runs) * 100).toFixed(1);
      console.log(
        `   ${agentId}: ${data.runs} runs, ${successRate}% success rate`
      );
    });

    console.log("\n🧠 Knowledge Base:");
    console.log(`   Interactions: ${kb.interactions.length}`);
    console.log(`   Insights: ${kb.insights.length}`);
    console.log(`   Patterns: ${kb.patterns.length}`);

    console.log("\n🔄 Deployed Workflows:");
    console.log(`   Active: ${workflows.deployed.length}`);
    console.log(`   Templates: ${workflows.templates.length}`);
  }

  // Run real business operations
  async run() {
    await this.init();

    console.log("🎯 Starting REAL Business Operations...\n");

    // Define real business tasks
    const realTasks = [
      {
        type: "email_processing",
        description: "Process customer feedback email",
        priority: "high",
        input: {
          email_content: "Your product is amazing! I love the new features.",
          customer_email: "customer@example.com",
          subject: "Positive Feedback",
        },
      },
      {
        type: "schema_generation",
        description: "Generate schema for customer feedback system",
        priority: "medium",
        input: {
          description:
            "Schema for customer feedback with rating, sentiment, and category",
        },
      },
      {
        type: "workflow_generation",
        description: "Create workflow for automated customer response system",
        priority: "high",
        input: {
          request:
            "Create a workflow that processes customer emails and generates appropriate responses",
        },
      },
    ];

    // Execute real tasks
    for (const task of realTasks) {
      await this.executeRealBusinessTask(task);
      console.log("⏳ Waiting 3 seconds before next task...\n");
      await new Promise((resolve) => setTimeout(resolve, 3000));
    }

    // Show real metrics
    this.showRealMetrics();

    console.log("\n🎉 REAL Business Operations completed!");
    console.log(
      "Check the business_data directory for actual files generated."
    );
  }
}

// Run real business operations
async function main() {
  const operations = new RealBusinessOperations();
  await operations.run();
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = { RealBusinessOperations };
