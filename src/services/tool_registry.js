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
      // For OpenAI JSON Schema tool, use direct API call
      if (tool.id === 'openai_json_schema') {
        return await this.executeDirectOpenAICall(inputData, options);
      }

      // For other tools, call an HTTP In endpoint matching the tool id if present
      const endpoint = tool.config?.endpoint || `/api/tools/${tool.id}`;
      const response = await axios.post(
        `${this.config.nodeRedUrl}${endpoint}`,
        inputData,
        {
          timeout: options.timeout || 30000,
          headers: { 'Content-Type': 'application/json' }
        }
      );

      // Accept either {success:.., data:..} or raw
      const data = response.data;
      if (data && typeof data === 'object' && 'success' in data) {
        if (!data.success) throw new Error(data.error || 'Tool execution failed');
        return data.data ?? data.result ?? data;
      }
      return data;

    } catch (error) {
      if (error.code === 'ECONNREFUSED') {
        throw new Error(`Cannot connect to Node-RED at ${this.config.nodeRedUrl}`);
      }
      if (error.response && error.response.status === 404) {
        // Node-RED is running but endpoint doesn't exist - simulate response for testing
        console.log('🚧 PLACEHOLDER: Node-RED endpoint not found, simulating response for testing');
        return {
          success: true,
          data: {
            content: `Simulated response for tool: ${tool.name}`,
            toolId: tool.id,
            inputData: inputData,
            simulated: true
          },
          usage: {
            promptTokens: 0,
            completionTokens: 0,
            totalTokens: 0
          },
          executionTime: Date.now(),
          timestamp: new Date().toISOString()
        };
      }
      throw new Error(`Node-RED flow execution failed: ${error.message}`);
    }
  }



  /**
   * Execute direct OpenAI API call with optional web search
   */
  async executeDirectOpenAICall(inputData, options = {}) {
    try {
      console.log('🤖 Executing OpenAI API call...');
      
      if (!process.env.OPENAI_API_KEY) {
        throw new Error('OPENAI_API_KEY environment variable not set');
      }

      // Validate and set default model for cost-effectiveness
      let model = inputData.model;
      if (!model || !['gpt-4.1-mini', 'gpt-4.1-nano'].includes(model)) {
        model = 'gpt-4.1-mini'; // Default to cost-effective model
        console.log(`🔄 Using cost-effective model: ${model}`);
      }

      // Check if web search is requested
      const enableWebSearch = inputData.enableWebSearch || false;
      if (enableWebSearch && model === 'gpt-4.1-nano') {
        console.log('⚠️ Web search not supported on gpt-4.1-nano, upgrading to gpt-4.1-mini');
        model = 'gpt-4.1-mini';
      }

      // Optimize token usage based on task type
      let maxTokens = inputData.maxTokens || 1000;
      if (inputData.taskType === 'simple_query') {
        maxTokens = Math.min(maxTokens, 500);
      } else if (inputData.taskType === 'analysis') {
        maxTokens = Math.min(maxTokens, 1500);
      } else if (inputData.taskType === 'report_generation') {
        maxTokens = Math.min(maxTokens, 3000);
      }

      const startTime = Date.now();
      
      // Prepare request payload
      const requestPayload = {
        model: model,
        messages: [
          {
            role: 'system',
            content: `You are a helpful AI assistant that provides accurate, up-to-date information. ${inputData.schema ? 'Always ensure your response is a valid JSON object that matches the provided schema exactly.' : 'Be concise and efficient in your responses.'}`
          },
          {
            role: 'user',
            content: inputData.prompt
          }
        ],
        temperature: inputData.temperature || 0.7,
        max_tokens: maxTokens
      };

      // Add JSON response format if schema is provided
      if (inputData.schema) {
        requestPayload.response_format = { type: 'json_object' };
      }

      // Add web search tool if enabled
      if (enableWebSearch) {
        requestPayload.tools = [{ type: 'web_search_preview' }];
        console.log('🌐 Web search enabled for this request');
      }
      
      const response = await axios.post(
        'https://api.openai.com/v1/chat/completions',
        requestPayload,
        {
          headers: {
            'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
            'Content-Type': 'application/json'
          },
          timeout: options.timeout || 60000
        }
      );

      const executionTime = Date.now() - startTime;
      const content = response.data.choices[0].message.content;
      const usage = response.data.usage || {};

      // Parse the response
      let parsedData;
      if (inputData.schema) {
        parsedData = JSON.parse(content);
      } else {
        parsedData = { response: content };
      }

      // Extract web search annotations if present
      const annotations = response.data.choices[0].message.annotations || [];
      if (annotations.length > 0) {
        parsedData.webSources = annotations.map(annotation => ({
          url: annotation.url,
          title: annotation.title,
          position: annotation.position
        }));
        console.log(`📚 Web search found ${annotations.length} sources`);
      }

      console.log('✅ Direct OpenAI API call successful');
      
      return {
        success: true,
        data: parsedData,
        usage: {
          promptTokens: usage.prompt_tokens || 0,
          completionTokens: usage.completion_tokens || 0,
          totalTokens: usage.total_tokens || 0
        },
        executionTime: executionTime,
        timestamp: new Date().toISOString(),
        webSearchEnabled: enableWebSearch,
        webSources: annotations.length > 0 ? annotations.length : 0
      };

    } catch (error) {
      console.error('❌ Direct OpenAI API call failed:', error.message);
      if (error.response) {
        console.error('Response status:', error.response.status);
        console.error('Response data:', JSON.stringify(error.response.data, null, 2));
      }
      throw new Error(`Direct OpenAI API call failed: ${error.message}`);
    }
  }

  /**
   * Validate input data against schema
   */
  validateInputData(data, schema) {
    try {
      const Ajv = require('ajv');
      const ajv = new Ajv({ allErrors: true, strict: false });
      const validate = ajv.compile(schema || { type: 'object' });
      const valid = validate(data);
      return {
        valid: !!valid,
        errors: valid ? [] : (validate.errors || []).map(e => `${e.instancePath || e.dataPath || ''} ${e.message}`)
      };
    } catch (err) {
      return { valid: false, errors: [err.message] };
    }
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
        (tool.name && tool.name.toLowerCase().includes(searchTerm)) ||
        (tool.description && tool.description.toLowerCase().includes(searchTerm)) ||
        (tool.tags && tool.tags.some(tag => tag && tag.toLowerCase().includes(searchTerm)))
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
      let loadedCount = 0;
      
      for (const file of files) {
        if (file.endsWith('.json')) {
          try {
            const filePath = path.join(this.config.toolsDirectory, file);
            const toolData = JSON.parse(await fs.readFile(filePath, 'utf8'));
            
            // Validate tool data before registration
            if (toolData && toolData.name && toolData.description) {
              await this.registerTool(toolData);
              loadedCount++;
            } else {
              console.warn(`⚠️ Skipping invalid tool data in ${file}: missing required fields`);
            }
          } catch (fileError) {
            console.warn(`⚠️ Could not load tool from ${file}: ${fileError.message}`);
          }
        }
      }
      
      console.log(`📁 Loaded ${loadedCount} tools from directory`);
    } catch (error) {
      console.warn(`⚠️ Could not load tools from directory: ${error.message}`);
    }
  }

  /**
   * Load Node-RED flow from file
   */
  async loadNodeRedFlow(flowName) {
    try {
      const flowPath = path.join(__dirname, '../workflows', `${flowName}.json`);
      const flowData = await fs.readFile(flowPath, 'utf8');
      return JSON.parse(flowData);
    } catch (error) {
      console.warn(`⚠️ Could not load Node-RED flow ${flowName}: ${error.message}`);
      return null;
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
        description: 'Execute OpenAI API calls with JSON schema validation using cost-effective models',
        category: 'integration',
        nodeRedFlowId: 'openai_json_schema_flow',
        nodeRedFlow: await this.loadNodeRedFlow('openai_json_schema'),
        inputSchema: {
          type: 'object',
          properties: {
            model: { 
              type: 'string',
              enum: ['gpt-4.1-mini', 'gpt-4.1-nano'],
              default: 'gpt-4.1-mini',
              description: 'Cost-effective OpenAI model'
            },
            prompt: { type: 'string' },
            schema: { type: 'object' },
            temperature: { type: 'number', default: 0.7 },
            maxTokens: { type: 'number', default: 1000 },
            taskType: {
              type: 'string',
              enum: ['simple_query', 'analysis', 'report_generation'],
              default: 'simple_query',
              description: 'Task type for token optimization'
            }
          },
          required: ['prompt', 'schema']
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
        tags: ['openai', 'api', 'json-schema', 'ai', 'cost-effective']
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