#!/usr/bin/env node

const FractalAgentCLI = require("./fractal_agent_cli");
const fs = require("fs");
const path = require("path");

class SimpleTaskManager {
  constructor() {
    this.cli = new FractalAgentCLI();
    this.tasks = new Map();
    this.taskQueue = [];
    this.completedTasks = [];
    this.failedTasks = [];
    this.dataDir = "./simple_task_data";

    // Initialize data directory
    if (!fs.existsSync(this.dataDir)) {
      fs.mkdirSync(this.dataDir, { recursive: true });
    }

    // Task statuses
    this.taskStatuses = {
      PENDING: "pending",
      RUNNING: "running",
      COMPLETED: "completed",
      FAILED: "failed",
    };

    // Task priorities
    this.taskPriorities = {
      LOW: "low",
      MEDIUM: "medium",
      HIGH: "high",
      CRITICAL: "critical",
    };

    // Simple workflow templates
    this.workflowTemplates = {
      content_creation: {
        name: "Content Creation Workflow",
        description: "Create content using available agents",
        schema: {
          type: "object",
          properties: {
            topic: { type: "string", description: "Content topic" },
            targetAudience: { type: "string", description: "Target audience" },
            contentType: {
              type: "string",
              enum: ["blog_post", "social_media", "email"],
            },
            wordCount: { type: "number", description: "Target word count" },
          },
          required: ["topic", "targetAudience", "contentType"],
        },
        steps: [
          {
            step: 1,
            action: "generate_schema",
            description: "Generate content schema",
          },
          {
            step: 2,
            action: "create_workflow",
            description: "Create content workflow",
          },
          {
            step: 3,
            action: "process_content",
            description: "Process content with agents",
          },
        ],
      },
      customer_support: {
        name: "Customer Support Workflow",
        description: "Handle customer support requests",
        schema: {
          type: "object",
          properties: {
            customerEmail: { type: "string", format: "email" },
            inquiry: { type: "string", description: "Customer inquiry" },
            priority: {
              type: "string",
              enum: ["low", "medium", "high", "urgent"],
            },
          },
          required: ["customerEmail", "inquiry"],
        },
        steps: [
          {
            step: 1,
            action: "analyze_email",
            description: "Analyze customer email",
          },
          {
            step: 2,
            action: "generate_response",
            description: "Generate response",
          },
          {
            step: 3,
            action: "create_followup",
            description: "Create follow-up workflow",
          },
        ],
      },
      data_analysis: {
        name: "Data Analysis Workflow",
        description: "Analyze data using available agents",
        schema: {
          type: "object",
          properties: {
            dataSource: {
              type: "string",
              description: "Data source identifier",
            },
            analysisType: {
              type: "string",
              enum: ["trend", "segmentation", "prediction"],
            },
            outputFormat: {
              type: "string",
              enum: ["report", "dashboard", "api"],
            },
          },
          required: ["dataSource", "analysisType"],
        },
        steps: [
          {
            step: 1,
            action: "collect_data",
            description: "Collect data for analysis",
          },
          {
            step: 2,
            action: "analyze_data",
            description: "Perform data analysis",
          },
          {
            step: 3,
            action: "generate_report",
            description: "Generate analysis report",
          },
        ],
      },
    };
  }

  async init() {
    console.log("📋 SIMPLE TASK MANAGEMENT SYSTEM");
    console.log("=================================\n");

    await this.cli.init();
    this.cli.loadState();

    // Load existing tasks
    this.loadTaskData();

    console.log("✅ Simple task management system initialized");
    console.log(`📊 Active tasks: ${this.tasks.size}`);
    console.log(
      `🔄 Available workflows: ${Object.keys(this.workflowTemplates).length}`
    );
  }

  // Create a new task
  createTask(workflowType, inputData, priority = "medium", metadata = {}) {
    const template = this.workflowTemplates[workflowType];
    if (!template) {
      throw new Error(`Workflow template not found: ${workflowType}`);
    }

    // Validate input data against schema
    const validationResult = this.validateInputData(inputData, template.schema);
    if (!validationResult.valid) {
      throw new Error(
        `Invalid input data: ${validationResult.errors.join(", ")}`
      );
    }

    const taskId = `task_${Date.now()}_${Math.random()
      .toString(36)
      .substr(2, 9)}`;
    const task = {
      id: taskId,
      workflowType,
      name: template.name,
      description: template.description,
      status: this.taskStatuses.PENDING,
      priority,
      inputData,
      metadata: {
        createdAt: new Date().toISOString(),
        createdBy: metadata.createdBy || "system",
        estimatedDuration: metadata.estimatedDuration || "unknown",
        ...metadata,
      },
      workflow: {
        template: template,
        currentStep: 0,
        totalSteps: template.steps.length,
        results: {},
      },
      execution: {
        startTime: null,
        endTime: null,
        duration: null,
        agentAssignments: [],
        errors: [],
      },
    };

    this.tasks.set(taskId, task);
    this.taskQueue.push(taskId);
    this.saveTaskData();

    console.log(`📋 Task created: ${taskId} (${template.name})`);
    console.log(`📊 Priority: ${priority}, Steps: ${template.steps.length}`);

    return task;
  }

  // Validate input data against schema
  validateInputData(inputData, schema) {
    const errors = [];

    // Check required properties
    if (schema.required) {
      schema.required.forEach((prop) => {
        if (!(prop in inputData)) {
          errors.push(`Missing required property: ${prop}`);
        }
      });
    }

    // Check property types
    if (schema.properties) {
      Object.entries(schema.properties).forEach(([prop, propSchema]) => {
        if (prop in inputData) {
          const value = inputData[prop];

          // Type validation
          if (propSchema.type === "string" && typeof value !== "string") {
            errors.push(`Property ${prop} must be a string`);
          } else if (
            propSchema.type === "number" &&
            typeof value !== "number"
          ) {
            errors.push(`Property ${prop} must be a number`);
          } else if (
            propSchema.type === "boolean" &&
            typeof value !== "boolean"
          ) {
            errors.push(`Property ${prop} must be a boolean`);
          }

          // Enum validation
          if (propSchema.enum && !propSchema.enum.includes(value)) {
            errors.push(
              `Property ${prop} must be one of: ${propSchema.enum.join(", ")}`
            );
          }

          // Format validation
          if (propSchema.format === "email") {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(value)) {
              errors.push(`Property ${prop} must be a valid email address`);
            }
          }
        }
      });
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  // Execute a task
  async executeTask(taskId) {
    const task = this.tasks.get(taskId);
    if (!task) {
      throw new Error(`Task not found: ${taskId}`);
    }

    if (task.status !== this.taskStatuses.PENDING) {
      throw new Error(`Task ${taskId} is not in pending status`);
    }

    console.log(`🚀 Executing task: ${taskId} (${task.name})`);
    console.log(
      `📊 Priority: ${task.priority}, Steps: ${task.workflow.totalSteps}`
    );

    task.status = this.taskStatuses.RUNNING;
    task.execution.startTime = new Date().toISOString();

    try {
      // Execute workflow steps
      for (
        let stepNumber = 1;
        stepNumber <= task.workflow.totalSteps;
        stepNumber++
      ) {
        await this.executeWorkflowStep(task, stepNumber);
      }

      // Complete task
      task.status = this.taskStatuses.COMPLETED;
      task.execution.endTime = new Date().toISOString();
      task.execution.duration =
        new Date(task.execution.endTime) - new Date(task.execution.startTime);

      this.completedTasks.push(taskId);
      this.saveTaskData();

      console.log(`✅ Task completed: ${taskId}`);
      console.log(`⏱️ Duration: ${task.execution.duration}ms`);

      return task;
    } catch (error) {
      console.error(`❌ Task failed: ${taskId} - ${error.message}`);

      task.status = this.taskStatuses.FAILED;
      task.execution.endTime = new Date().toISOString();
      task.execution.errors.push({
        step: task.workflow.currentStep,
        error: error.message,
        timestamp: new Date().toISOString(),
      });

      this.failedTasks.push(taskId);
      this.saveTaskData();

      throw error;
    }
  }

  // Execute a workflow step
  async executeWorkflowStep(task, stepNumber) {
    const step = task.workflow.template.steps.find(
      (s) => s.step === stepNumber
    );
    if (!step) {
      throw new Error(`Step ${stepNumber} not found in workflow`);
    }

    console.log(`\n🔄 Executing step ${stepNumber}: ${step.description}`);
    console.log(`📋 Action: ${step.action}`);

    task.workflow.currentStep = stepNumber;

    // Find available agents
    const availableAgents = Array.from(this.cli.deployedAgents.entries());

    if (availableAgents.length === 0) {
      throw new Error(`No agents available for step ${stepNumber}`);
    }

    // Select appropriate agent based on action
    const [agentId, agent] = this.selectAgentForAction(
      step.action,
      availableAgents
    );
    task.execution.agentAssignments.push({
      step: stepNumber,
      agentId,
      agentType: agent.type,
      action: step.action,
    });

    // Execute the step
    try {
      const result = await this.executeStep(task, step, agentId);

      // Store result
      task.workflow.results[stepNumber] = {
        agentId,
        action: step.action,
        description: step.description,
        result,
        timestamp: new Date().toISOString(),
      };

      console.log(`✅ Step ${stepNumber} completed by ${agentId}`);

      return result;
    } catch (error) {
      console.error(`❌ Step ${stepNumber} failed: ${error.message}`);
      throw error;
    }
  }

  // Select appropriate agent for action
  selectAgentForAction(action, availableAgents) {
    // Simple agent selection logic
    const actionAgentMap = {
      generate_schema: "schema_generator",
      create_workflow: "workflow_generator",
      process_content: "email_processor",
      analyze_email: "email_processor",
      generate_response: "schema_generator",
      create_followup: "workflow_generator",
      collect_data: "analytics_agent",
      analyze_data: "analytics_agent",
      generate_report: "analytics_agent",
    };

    const preferredAgentType = actionAgentMap[action];

    if (preferredAgentType) {
      const preferredAgent = availableAgents.find(
        ([id, agent]) => agent.type === preferredAgentType
      );
      if (preferredAgent) {
        return preferredAgent;
      }
    }

    // Fallback to first available agent
    return availableAgents[0];
  }

  // Execute a step
  async executeStep(task, step, agentId) {
    console.log(`🏃 Executing step: ${step.action} on agent: ${agentId}`);

    // Prepare step input
    const stepInput = {
      ...task.inputData,
      stepNumber: step.step,
      action: step.action,
      description: step.description,
      taskId: task.id,
      timestamp: new Date().toISOString(),
    };

    try {
      // Execute the agent
      const result = await this.cli.runAgent(agentId, {
        action: step.action,
        input: stepInput,
        timestamp: new Date().toISOString(),
      });

      return {
        success: true,
        agentId,
        action: step.action,
        result,
        executionTime: Date.now(),
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      return {
        success: false,
        agentId,
        action: step.action,
        error: error.message,
        timestamp: new Date().toISOString(),
      };
    }
  }

  // Get task status
  getTaskStatus(taskId) {
    const task = this.tasks.get(taskId);
    if (!task) {
      return null;
    }

    return {
      id: task.id,
      name: task.name,
      status: task.status,
      priority: task.priority,
      progress: {
        currentStep: task.workflow.currentStep,
        totalSteps: task.workflow.totalSteps,
        percentage:
          (task.workflow.currentStep / task.workflow.totalSteps) * 100,
      },
      execution: task.execution,
      createdAt: task.metadata.createdAt,
    };
  }

  // Get all tasks
  getAllTasks() {
    return Array.from(this.tasks.values()).map((task) => ({
      id: task.id,
      name: task.name,
      status: task.status,
      priority: task.priority,
      workflowType: task.workflowType,
      createdAt: task.metadata.createdAt,
    }));
  }

  // Get task statistics
  getTaskStatistics() {
    const stats = {
      total: this.tasks.size,
      pending: 0,
      running: 0,
      completed: 0,
      failed: 0,
      byPriority: {
        low: 0,
        medium: 0,
        high: 0,
        critical: 0,
      },
      byWorkflowType: {},
      averageExecutionTime: 0,
    };

    let totalExecutionTime = 0;
    let completedCount = 0;

    this.tasks.forEach((task) => {
      stats[task.status]++;
      stats.byPriority[task.priority]++;

      if (!stats.byWorkflowType[task.workflowType]) {
        stats.byWorkflowType[task.workflowType] = 0;
      }
      stats.byWorkflowType[task.workflowType]++;

      if (task.execution.duration) {
        totalExecutionTime += task.execution.duration;
        completedCount++;
      }
    });

    if (completedCount > 0) {
      stats.averageExecutionTime = totalExecutionTime / completedCount;
    }

    return stats;
  }

  // Save task data
  saveTaskData() {
    const taskData = {
      tasks: Array.from(this.tasks.entries()),
      taskQueue: this.taskQueue,
      completedTasks: this.completedTasks,
      failedTasks: this.failedTasks,
      timestamp: new Date().toISOString(),
    };

    const taskFile = path.join(this.dataDir, "task_data.json");
    fs.writeFileSync(taskFile, JSON.stringify(taskData, null, 2));
  }

  // Load task data
  loadTaskData() {
    const taskFile = path.join(this.dataDir, "task_data.json");

    if (fs.existsSync(taskFile)) {
      const taskData = JSON.parse(fs.readFileSync(taskFile, "utf8"));

      this.tasks = new Map(taskData.tasks || []);
      this.taskQueue = taskData.taskQueue || [];
      this.completedTasks = taskData.completedTasks || [];
      this.failedTasks = taskData.failedTasks || [];

      console.log(`📂 Loaded ${this.tasks.size} existing tasks`);
    }
  }

  // Run task management demo
  async runTaskManagementDemo() {
    console.log("\n🎬 SIMPLE TASK MANAGEMENT DEMO");
    console.log("==============================\n");

    // Demo 1: Content Creation Task
    console.log("📝 Demo 1: Content Creation Task");
    console.log("--------------------------------");

    const contentTask = this.createTask(
      "content_creation",
      {
        topic: "AI-Powered Task Management Systems",
        targetAudience: "software developers",
        contentType: "blog_post",
        wordCount: 1000,
      },
      "high",
      {
        createdBy: "demo_user",
        estimatedDuration: "5 minutes",
      }
    );

    await this.executeTask(contentTask.id);

    // Demo 2: Customer Support Task
    console.log("\n📧 Demo 2: Customer Support Task");
    console.log("--------------------------------");

    const supportTask = this.createTask(
      "customer_support",
      {
        customerEmail: "customer@example.com",
        inquiry: "I need help with my subscription renewal",
        priority: "high",
      },
      "critical",
      {
        createdBy: "demo_user",
        estimatedDuration: "3 minutes",
      }
    );

    await this.executeTask(supportTask.id);

    // Show task statistics
    console.log("\n📊 Task Management Statistics:");
    console.log("=============================");
    const stats = this.getTaskStatistics();
    console.log(`📋 Total Tasks: ${stats.total}`);
    console.log(`✅ Completed: ${stats.completed}`);
    console.log(`❌ Failed: ${stats.failed}`);
    console.log(
      `⏱️ Average Execution Time: ${Math.round(stats.averageExecutionTime)}ms`
    );

    console.log("\n📈 Tasks by Priority:");
    Object.entries(stats.byPriority).forEach(([priority, count]) => {
      console.log(`   ${priority}: ${count}`);
    });

    console.log("\n🔄 Tasks by Workflow Type:");
    Object.entries(stats.byWorkflowType).forEach(([type, count]) => {
      console.log(`   ${type}: ${count}`);
    });

    console.log("\n✅ Simple task management demo completed!");
  }
}

// Run simple task management system
async function main() {
  const taskManager = new SimpleTaskManager();
  await taskManager.init();
  await taskManager.runTaskManagementDemo();
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = { SimpleTaskManager };
