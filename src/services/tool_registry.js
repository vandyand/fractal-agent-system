const axios = require('axios');
const fs = require('fs').promises;
const path = require('path');

/**
 * Tool Registry
 * 
 * Manages all executable tools (Node-RED flows) that agents can use.
 * Each tool is a Node-RED flow that can be executed with specific parameters.
 */
class ToolRegistry {
  constructor(config = {}) {
    this.config = {
      nodeRedUrl: config.nodeRedUrl || 'http://localhost:1880',
      toolsDirectory: config.toolsDirectory || path.join(__dirname, '../tools'),
      enableAutoDiscovery: config.enableAutoDiscovery !== false,
      ...config
    };
    
    this.tools = new Map();
    this.categories = new Map();
    this.executionHistory = [];
    this.performanceMetrics = new Map();
    
    // Tool categories
    this.defaultCategories = [
      'research',
      'analysis', 
      'reporting',
      'communication',
      'automation',
      'integration',
      'monitoring',
      'optimization'
    ];
    
    this.initializeCategories();
  }

  /**
   * Initialize tool categories
   */
  initializeCategories() {
    this.defaultCategories.forEach(category => {
      this.categories.set(category, {
        name: category,
        description: `${category} tools`,
        tools: [],
        totalExecutions: 0,
        successRate: 0,
        averageExecutionTime: 0
      });
    });
  }

  /**
   * Register a new tool (Node-RED flow)
   */
  async registerTool(toolData) {
    const toolId = toolData.id || `tool_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const tool = {
      id: toolId,
      name: toolData.name,
      description: toolData.description,
      category: toolData.category || 'general',
      nodeRedFlowId: toolData.nodeRedFlowId,
      nodeRedFlow: toolData.nodeRedFlow,
      inputSchema: toolData.inputSchema || {},
      outputSchema: toolData.outputSchema || {},
      requiredPermissions: toolData.requiredPermissions || [],
      agentAccess: toolData.agentAccess || [], // Which agents can use this tool
      status: 'registered',
      version: toolData.version || '1.0.0',
      author: toolData.author || 'system',
      tags: toolData.tags || [],
      config: toolData.config || {},
      registeredAt: new Date().toISOString(),
      lastExecuted: null,
      executionCount: 0,
      successCount: 0,
      failureCount: 0,
      averageExecutionTime: 0,
      totalExecutionTime: 0
    };

    this.tools.set(toolId, tool);
    
    // Add to category
    if (this.categories.has(tool.category)) {
      this.categories.get(tool.category).tools.push(toolId);
    } else {
      // Create new category if it doesn't exist
      this.categories.set(tool.category, {
        name: tool.category,
        description: `${tool.category} tools`,
        tools: [toolId],
        totalExecutions: 0,
        successRate: 0,
        averageExecutionTime: 0
      });
    }

    console.log(`🔧 Tool registered: ${tool.name} (${toolId})`);
    return tool;
  }

  /**
   * Execute a tool (Node-RED flow)
   */
  async executeTool(toolId, inputData, options = {}) {
    const tool = this.tools.get(toolId);
    if (!tool) {
      throw new Error(`Tool not found: ${toolId}`);
    }

    if (tool.status !== 'registered' && tool.status !== 'active') {
      throw new Error(`Tool ${toolId} is not available for execution (status: ${tool.status})`);
    }

    const startTime = Date.now();
    const executionId = `exec_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    console.log(`🚀 Executing tool: ${tool.name} (${toolId})`);

    try {
      // Validate input data against schema
      if (tool.inputSchema && Object.keys(tool.inputSchema).length > 0) {
        const validationResult = this.validateInputData(inputData, tool.inputSchema);
        if (!validationResult.valid) {
          throw new Error(`Invalid input data: ${validationResult.errors.join(', ')}`);
        }
      }

      // Execute Node-RED flow
      const result = await this.executeNodeRedFlow(tool, inputData, options);

      const executionTime = Date.now() - startTime;
      
      // Update tool metrics
      this.updateToolMetrics(toolId, true, executionTime);
      
      // Log execution
      this.logExecution(executionId, toolId, inputData, result, executionTime, true);

      console.log(`✅ Tool executed successfully: ${tool.name} (${executionTime}ms)`);

      return {
        success: true,
        toolId,
        toolName: tool.name,
        executionId,
        result,
        executionTime,
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      const executionTime = Date.now() - startTime;
      
      // Update tool metrics
      this.updateToolMetrics(toolId, false, executionTime);
      
      // Log execution
      this.logExecution(executionId, toolId, inputData, { error: error.message }, executionTime, false);

      console.error(`❌ Tool execution failed: ${tool.name} - ${error.message}`);

      throw error;
    }
  }

  /**
   * Execute Node-RED flow
   */
  async executeNodeRedFlow(tool, inputData, options = {}) {
    if (!tool.nodeRedFlowId) {
      throw new Error(`Tool ${tool.id} does not have a Node-RED flow ID`);
    }

    try {
      // Prepare the request to Node-RED
      const requestData = {
        flowId: tool.nodeRedFlowId,
        input: inputData,
        options: {
          timeout: options.timeout || 30000,
          retries: options.retries || 0,
          ...options
        },
        timestamp: new Date().toISOString()
      };

      // Make HTTP request to Node-RED
      const response = await axios.post(
        `${this.config.nodeRedUrl}/api/flow/execute`,
        requestData,
        {
          timeout: options.timeout || 30000,
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data.success) {
        return response.data.result;
      } else {
        throw new Error(response.data.error || 'Node-RED flow execution failed');
      }

    } catch (error) {
      if (error.code === 'ECONNREFUSED') {
        throw new Error(`Cannot connect to Node-RED at ${this.config.nodeRedUrl}`);
      }
      throw new Error(`Node-RED flow execution failed: ${error.message}`);
    }
  }

  /**
   * Validate input data against schema
   */
  validateInputData(data, schema) {
    // TODO: Implement proper JSON schema validation with AJV
    // For now, return valid
    return { valid: true, errors: [] };
  }

  /**
   * Update tool performance metrics
   */
  updateToolMetrics(toolId, success, executionTime) {
    const tool = this.tools.get(toolId);
    if (!tool) return;

    tool.executionCount++;
    tool.totalExecutionTime += executionTime;
    tool.averageExecutionTime = tool.totalExecutionTime / tool.executionCount;
    tool.lastExecuted = new Date().toISOString();

    if (success) {
      tool.successCount++;
    } else {
      tool.failureCount++;
    }

    // Update category metrics
    if (this.categories.has(tool.category)) {
      const category = this.categories.get(tool.category);
      category.totalExecutions++;
      category.successRate = (category.totalExecutions - tool.failureCount) / category.totalExecutions;
    }
  }

  /**
   * Log execution history
   */
  logExecution(executionId, toolId, inputData, result, executionTime, success) {
    const execution = {
      id: executionId,
      toolId,
      inputData,
      result,
      executionTime,
      success,
      timestamp: new Date().toISOString()
    };

    this.executionHistory.push(execution);

    // Keep only last 1000 executions
    if (this.executionHistory.length > 1000) {
      this.executionHistory = this.executionHistory.slice(-1000);
    }
  }

  /**
   * Get tools by category
   */
  getToolsByCategory(category) {
    if (!this.categories.has(category)) {
      return [];
    }

    const categoryData = this.categories.get(category);
    return categoryData.tools.map(toolId => this.tools.get(toolId)).filter(Boolean);
  }

  /**
   * Get tools accessible by agent
   */
  getToolsForAgent(agentId) {
    return Array.from(this.tools.values()).filter(tool => 
      tool.agentAccess.length === 0 || tool.agentAccess.includes(agentId)
    );
  }

  /**
   * Search tools
   */
  searchTools(query, filters = {}) {
    let results = Array.from(this.tools.values());

    // Filter by query
    if (query) {
      const searchTerm = query.toLowerCase();
      results = results.filter(tool => 
        tool.name.toLowerCase().includes(searchTerm) ||
        tool.description.toLowerCase().includes(searchTerm) ||
        tool.tags.some(tag => tag.toLowerCase().includes(searchTerm))
      );
    }

    // Filter by category
    if (filters.category) {
      results = results.filter(tool => tool.category === filters.category);
    }

    // Filter by status
    if (filters.status) {
      results = results.filter(tool => tool.status === filters.status);
    }

    // Filter by agent access
    if (filters.agentId) {
      results = results.filter(tool => 
        tool.agentAccess.length === 0 || tool.agentAccess.includes(filters.agentId)
      );
    }

    return results;
  }

  /**
   * Get tool statistics
   */
  getToolStats(toolId) {
    const tool = this.tools.get(toolId);
    if (!tool) return null;

    return {
      id: tool.id,
      name: tool.name,
      executionCount: tool.executionCount,
      successCount: tool.successCount,
      failureCount: tool.failureCount,
      successRate: tool.executionCount > 0 ? tool.successCount / tool.executionCount : 0,
      averageExecutionTime: tool.averageExecutionTime,
      lastExecuted: tool.lastExecuted,
      registeredAt: tool.registeredAt
    };
  }

  /**
   * Get registry statistics
   */
  getRegistryStats() {
    const tools = Array.from(this.tools.values());
    const categories = Array.from(this.categories.values());

    return {
      totalTools: tools.length,
      activeTools: tools.filter(t => t.status === 'active').length,
      registeredTools: tools.filter(t => t.status === 'registered').length,
      totalExecutions: tools.reduce((sum, t) => sum + t.executionCount, 0),
      totalSuccessRate: tools.length > 0 ? 
        tools.reduce((sum, t) => sum + (t.successCount / t.executionCount || 0), 0) / tools.length : 0,
      categories: categories.length,
      averageExecutionTime: tools.length > 0 ? 
        tools.reduce((sum, t) => sum + t.averageExecutionTime, 0) / tools.length : 0,
      lastUpdated: new Date().toISOString()
    };
  }

  /**
   * Load tools from directory
   */
  async loadToolsFromDirectory() {
    if (!this.config.enableAutoDiscovery) return;

    try {
      const files = await fs.readdir(this.config.toolsDirectory);
      
      for (const file of files) {
        if (file.endsWith('.json')) {
          const filePath = path.join(this.config.toolsDirectory, file);
          const toolData = JSON.parse(await fs.readFile(filePath, 'utf8'));
          
          await this.registerTool(toolData);
        }
      }
      
      console.log(`📁 Loaded ${files.length} tools from directory`);
    } catch (error) {
      console.warn(`⚠️ Could not load tools from directory: ${error.message}`);
    }
  }

  /**
   * Save tool to file
   */
  async saveToolToFile(toolId) {
    const tool = this.tools.get(toolId);
    if (!tool) return;

    try {
      const filePath = path.join(this.config.toolsDirectory, `${toolId}.json`);
      await fs.writeFile(filePath, JSON.stringify(tool, null, 2));
      console.log(`💾 Tool saved to file: ${filePath}`);
    } catch (error) {
      console.error(`❌ Could not save tool to file: ${error.message}`);
    }
  }

  /**
   * Initialize the registry
   */
  async initialize() {
    console.log('🔧 Initializing Tool Registry...');
    
    // Load tools from directory
    await this.loadToolsFromDirectory();
    
    // Register default tools
    await this.registerDefaultTools();
    
    console.log(`✅ Tool Registry initialized with ${this.tools.size} tools`);
  }

  /**
   * Register default tools
   */
  async registerDefaultTools() {
    const defaultTools = [
      {
        id: 'openai_json_schema',
        name: 'OpenAI JSON Schema API',
        description: 'Execute OpenAI API calls with JSON schema validation',
        category: 'integration',
        nodeRedFlowId: 'openai_json_schema_flow',
        inputSchema: {
          type: 'object',
          properties: {
            model: { type: 'string' },
            prompt: { type: 'string' },
            schema: { type: 'object' },
            temperature: { type: 'number' },
            maxTokens: { type: 'number' }
          },
          required: ['model', 'prompt', 'schema']
        },
        outputSchema: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            data: { type: 'object' },
            usage: { type: 'object' },
            timestamp: { type: 'string' }
          }
        },
        agentAccess: [], // All agents can use this
        status: 'active',
        version: '1.0.0',
        author: 'system',
        tags: ['openai', 'api', 'json-schema', 'ai']
      },
      {
        id: 'web_scraping_tool',
        name: 'Web Scraping Tool',
        description: 'Scrape web content with structured output',
        category: 'research',
        nodeRedFlowId: 'web_scraping_flow',
        inputSchema: {
          type: 'object',
          properties: {
            url: { type: 'string' },
            selectors: { type: 'object' },
            options: { type: 'object' }
          },
          required: ['url']
        },
        agentAccess: ['team-web-research-001', 'specialized-document-processor-001'],
        status: 'placeholder',
        version: '1.0.0',
        author: 'system',
        tags: ['web-scraping', 'research', 'data-extraction']
      },
      {
        id: 'document_parser_tool',
        name: 'Document Parser Tool',
        description: 'Parse documents with hierarchical structure extraction',
        category: 'research',
        nodeRedFlowId: 'document_parser_flow',
        inputSchema: {
          type: 'object',
          properties: {
            documentUrl: { type: 'string' },
            documentType: { type: 'string' },
            options: { type: 'object' }
          },
          required: ['documentUrl']
        },
        agentAccess: ['specialized-document-processor-001'],
        status: 'placeholder',
        version: '1.0.0',
        author: 'system',
        tags: ['document-parsing', 'research', 'content-extraction']
      }
    ];

    for (const toolData of defaultTools) {
      await this.registerTool(toolData);
    }
  }
}

module.exports = { ToolRegistry }; 