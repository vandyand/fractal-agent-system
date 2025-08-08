#!/usr/bin/env node

const FractalAgentCLI = require("../agents/fractal_agent_cli");
const fs = require("fs");
const path = require("path");
const EventEmitter = require("events");

class TaskManagementSystem extends EventEmitter {
  constructor() {
    super();
    this.cli = new FractalAgentCLI();
    this.tasks = new Map();
    this.workflows = new Map();
    this.taskQueue = [];
    this.completedTasks = [];
    this.failedTasks = [];
    this.dataDir = "./task_management_data";

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
      CANCELLED: "cancelled",
    };

    // Task priorities
    this.taskPriorities = {
      LOW: "low",
      MEDIUM: "medium",
      HIGH: "high",
      CRITICAL: "critical",
    };

    // Standardized workflow templates with Node-RED JSON flows
    this.workflowTemplates = {
      content_creation: {
        name: "Content Creation Workflow",
        description: "Complete content production pipeline",
        schema: {
          type: "object",
          properties: {
            topic: { type: "string", description: "Content topic" },
            targetAudience: { type: "string", description: "Target audience" },
            contentType: {
              type: "string",
              enum: ["blog_post", "social_media", "email", "video_script"],
            },
            wordCount: { type: "number", description: "Target word count" },
            tone: {
              type: "string",
              enum: ["professional", "casual", "technical", "conversational"],
            },
          },
          required: ["topic", "targetAudience", "contentType"],
        },
        nodeRedFlow: {
          id: "content_creation_workflow",
          label: "Content Creation Workflow",
          nodes: [
            {
              id: "research_node",
              type: "openai-function",
              name: "Research Topic",
              config: {
                function: "research_topic",
                schema: {
                  type: "object",
                  properties: {
                    topic: { type: "string" },
                    researchDepth: {
                      type: "string",
                      enum: ["basic", "comprehensive", "expert"],
                    },
                  },
                },
              },
            },
            {
              id: "outline_node",
              type: "openai-function",
              name: "Create Outline",
              config: {
                function: "create_outline",
                schema: {
                  type: "object",
                  properties: {
                    researchData: { type: "object" },
                    structure: {
                      type: "string",
                      enum: [
                        "chronological",
                        "problem_solution",
                        "list",
                        "story",
                      ],
                    },
                  },
                },
              },
            },
            {
              id: "writing_node",
              type: "openai-function",
              name: "Write Content",
              config: {
                function: "write_content",
                schema: {
                  type: "object",
                  properties: {
                    outline: { type: "object" },
                    tone: { type: "string" },
                    wordCount: { type: "number" },
                  },
                },
              },
            },
            {
              id: "review_node",
              type: "openai-function",
              name: "Review Content",
              config: {
                function: "review_content",
                schema: {
                  type: "object",
                  properties: {
                    content: { type: "string" },
                    criteria: { type: "array", items: { type: "string" } },
                  },
                },
              },
            },
          ],
          connections: [
            { from: "research_node", to: "outline_node" },
            { from: "outline_node", to: "writing_node" },
            { from: "writing_node", to: "review_node" },
          ],
        },
        steps: [
          {
            step: 1,
            agent_type: "research_agent",
            action: "research_topic",
            nodeId: "research_node",
          },
          {
            step: 2,
            agent_type: "outline_agent",
            action: "create_outline",
            nodeId: "outline_node",
          },
          {
            step: 3,
            agent_type: "writing_agent",
            action: "write_content",
            nodeId: "writing_node",
          },
          {
            step: 4,
            agent_type: "review_agent",
            action: "review_content",
            nodeId: "review_node",
          },
        ],
      },
      customer_support: {
        name: "Customer Support Workflow",
        description: "Automated customer service pipeline",
        schema: {
          type: "object",
          properties: {
            customerEmail: { type: "string", format: "email" },
            inquiry: { type: "string", description: "Customer inquiry" },
            priority: {
              type: "string",
              enum: ["low", "medium", "high", "urgent"],
            },
            category: {
              type: "string",
              enum: ["technical", "billing", "product", "general"],
            },
          },
          required: ["customerEmail", "inquiry"],
        },
        nodeRedFlow: {
          id: "customer_support_workflow",
          label: "Customer Support Workflow",
          nodes: [
            {
              id: "email_analysis_node",
              type: "openai-function",
              name: "Analyze Email",
              config: {
                function: "analyze_email",
                schema: {
                  type: "object",
                  properties: {
                    emailContent: { type: "string" },
                    sentiment: {
                      type: "string",
                      enum: ["positive", "neutral", "negative", "urgent"],
                    },
                  },
                },
              },
            },
            {
              id: "knowledge_lookup_node",
              type: "openai-function",
              name: "Find Solution",
              config: {
                function: "find_solution",
                schema: {
                  type: "object",
                  properties: {
                    inquiry: { type: "string" },
                    category: { type: "string" },
                    knowledgeBase: { type: "object" },
                  },
                },
              },
            },
            {
              id: "response_generation_node",
              type: "openai-function",
              name: "Generate Response",
              config: {
                function: "generate_response",
                schema: {
                  type: "object",
                  properties: {
                    solution: { type: "object" },
                    tone: {
                      type: "string",
                      enum: ["professional", "friendly", "empathetic"],
                    },
                    includeFollowUp: { type: "boolean" },
                  },
                },
              },
            },
          ],
          connections: [
            { from: "email_analysis_node", to: "knowledge_lookup_node" },
            { from: "knowledge_lookup_node", to: "response_generation_node" },
          ],
        },
        steps: [
          {
            step: 1,
            agent_type: "email_processor",
            action: "analyze_email",
            nodeId: "email_analysis_node",
          },
          {
            step: 2,
            agent_type: "knowledge_agent",
            action: "find_solution",
            nodeId: "knowledge_lookup_node",
          },
          {
            step: 3,
            agent_type: "response_agent",
            action: "generate_response",
            nodeId: "response_generation_node",
          },
        ],
      },
      data_analysis: {
        name: "Data Analysis Workflow",
        description: "Complete data processing pipeline",
        schema: {
          type: "object",
          properties: {
            dataSource: {
              type: "string",
              description: "Data source identifier",
            },
            analysisType: {
              type: "string",
              enum: [
                "trend_analysis",
                "segmentation",
                "prediction",
                "anomaly_detection",
              ],
            },
            outputFormat: {
              type: "string",
              enum: ["report", "dashboard", "visualization", "api"],
            },
            timeRange: {
              type: "string",
              description: "Time range for analysis",
            },
          },
          required: ["dataSource", "analysisType"],
        },
        nodeRedFlow: {
          id: "data_analysis_workflow",
          label: "Data Analysis Workflow",
          nodes: [
            {
              id: "data_collection_node",
              type: "openai-function",
              name: "Collect Data",
              config: {
                function: "collect_data",
                schema: {
                  type: "object",
                  properties: {
                    source: { type: "string" },
                    filters: { type: "object" },
                    timeRange: { type: "string" },
                  },
                },
              },
            },
            {
              id: "data_cleaning_node",
              type: "openai-function",
              name: "Clean Data",
              config: {
                function: "clean_data",
                schema: {
                  type: "object",
                  properties: {
                    rawData: { type: "object" },
                    cleaningRules: { type: "array", items: { type: "string" } },
                  },
                },
              },
            },
            {
              id: "analysis_node",
              type: "openai-function",
              name: "Analyze Data",
              config: {
                function: "analyze_data",
                schema: {
                  type: "object",
                  properties: {
                    cleanData: { type: "object" },
                    analysisType: { type: "string" },
                    parameters: { type: "object" },
                  },
                },
              },
            },
            {
              id: "report_generation_node",
              type: "openai-function",
              name: "Generate Report",
              config: {
                function: "generate_report",
                schema: {
                  type: "object",
                  properties: {
                    analysisResults: { type: "object" },
                    format: { type: "string" },
                    includeVisualizations: { type: "boolean" },
                  },
                },
              },
            },
          ],
          connections: [
            { from: "data_collection_node", to: "data_cleaning_node" },
            { from: "data_cleaning_node", to: "analysis_node" },
            { from: "analysis_node", to: "report_generation_node" },
          ],
        },
        steps: [
          {
            step: 1,
            agent_type: "data_collector",
            action: "collect_data",
            nodeId: "data_collection_node",
          },
          {
            step: 2,
            agent_type: "data_cleaner",
            action: "clean_data",
            nodeId: "data_cleaning_node",
          },
          {
            step: 3,
            agent_type: "analytics_agent",
            action: "analyze_data",
            nodeId: "analysis_node",
          },
          {
            step: 4,
            agent_type: "report_agent",
            action: "generate_report",
            nodeId: "report_generation_node",
          },
        ],
      },
    };
  }

  async init() {
    console.log("📋 ROBUST TASK MANAGEMENT SYSTEM");
    console.log("=================================\n");

    await this.cli.init();
    this.cli.loadState();

    // Load existing tasks and workflows
    this.loadTaskData();

    console.log("✅ Task management system initialized");
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
        nodeRedFlow: template.nodeRedFlow,
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

  // Validate input data against OpenAI JSON schema
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
          } else if (
            propSchema.type === "object" &&
            typeof value !== "object"
          ) {
            errors.push(`Property ${prop} must be an object`);
          } else if (propSchema.type === "array" && !Array.isArray(value)) {
            errors.push(`Property ${prop} must be an array`);
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

    console.log(`\n🔄 Executing step ${stepNumber}: ${step.action}`);
    console.log(`🤖 Agent type: ${step.agent_type}`);

    task.workflow.currentStep = stepNumber;

    // Find appropriate agent
    const availableAgents = Array.from(
      this.cli.deployedAgents.entries()
    ).filter(([id, agent]) => agent.type === step.agent_type);

    if (availableAgents.length === 0) {
      console.log(
        `⚠️ No ${step.agent_type} agents available, using fallback agent`
      );
      const fallbackAgent = Array.from(this.cli.deployedAgents.entries())[0];
      if (fallbackAgent) {
        availableAgents.push(fallbackAgent);
      }
    }

    if (availableAgents.length === 0) {
      throw new Error(`No agents available for step ${stepNumber}`);
    }

    const [agentId, agent] = availableAgents[0];
    task.execution.agentAssignments.push({
      step: stepNumber,
      agentId,
      agentType: step.agent_type,
    });

    // Execute the step using Node-RED
    try {
      const result = await this.executeNodeRedStep(task, step, agentId);

      // Store result
      task.workflow.results[stepNumber] = {
        agentId,
        action: step.action,
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

  // Execute Node-RED step
  async executeNodeRedStep(task, step, agentId) {
    console.log(`🏃 Executing step: ${step.action}`);

    // Prepare input data for the step
    const stepInput = {
      ...task.inputData,
      stepNumber: step.step,
      agentId,
      action: step.action,
      timestamp: new Date().toISOString(),
    };

    // Execute the agent with the step data
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
  }

  // Deploy Node-RED flow
  async deployNodeRedFlow(nodeRedFlow) {
    console.log(`📦 Deploying Node-RED flow: ${nodeRedFlow.label}`);

    try {
      // Convert Node-RED flow to deployable format
      const deployableFlow = this.convertToDeployableFlow(nodeRedFlow);

      // Deploy the flow to Node-RED
      const deploymentResult = await this.cli.deployWorkflow(
        deployableFlow,
        nodeRedFlow.id
      );

      console.log(`✅ Node-RED flow deployed: ${nodeRedFlow.id}`);
      return deploymentResult;
    } catch (error) {
      console.error(`❌ Failed to deploy Node-RED flow: ${error.message}`);
      throw error;
    }
  }

  // Convert Node-RED flow to deployable format
  convertToDeployableFlow(nodeRedFlow) {
    const deployableFlow = [];

    // Add tab node
    deployableFlow.push({
      id: `${nodeRedFlow.id}_tab`,
      type: "tab",
      label: nodeRedFlow.label,
      disabled: false,
      info: "",
    });

    // Add nodes
    nodeRedFlow.nodes.forEach((node) => {
      const deployableNode = {
        id: node.id,
        type: node.type,
        name: node.name,
        tab: `${nodeRedFlow.id}_tab`,
        ...node.config,
      };
      deployableFlow.push(deployableNode);
    });

    return deployableFlow;
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
      cancelled: 0,
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
    console.log("\n🎬 TASK MANAGEMENT SYSTEM DEMO");
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
        wordCount: 1500,
        tone: "technical",
      },
      "high",
      {
        createdBy: "demo_user",
        estimatedDuration: "10 minutes",
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
        category: "billing",
      },
      "critical",
      {
        createdBy: "demo_user",
        estimatedDuration: "5 minutes",
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

    console.log("\n✅ Task management demo completed!");
  }
}

// Run task management system
async function main() {
  const taskManager = new TaskManagementSystem();
  await taskManager.init();
  await taskManager.runTaskManagementDemo();
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = { TaskManagementSystem };
 