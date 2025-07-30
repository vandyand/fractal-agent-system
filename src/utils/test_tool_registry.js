#!/usr/bin/env node

/**
 * Test script for the Tool Registry System
 * 
 * This script tests the Tool Registry functionality step by step:
 * 1. Tool Registry initialization
 * 2. Tool registration
 * 3. Tool execution (placeholders)
 * 4. Tool search and filtering
 * 5. Performance metrics
 */

const { ToolRegistry } = require('../services/tool_registry');

async function testToolRegistry() {
  console.log('🔧 Testing Tool Registry System\n');

  // Create Tool Registry
  const toolRegistry = new ToolRegistry({
    nodeRedUrl: 'http://localhost:1880',
    enableAutoDiscovery: true
  });

  console.log('📡 Tool Registry created\n');

  // Test 1: Initialize Tool Registry
  console.log('🧪 Test 1: Tool Registry Initialization\n');
  
  try {
    await toolRegistry.initialize();
    console.log(`✅ Tool Registry initialized with ${toolRegistry.tools.size} tools`);
    
    // Show default tools
    console.log('\n📋 Default Tools:');
    for (const [toolId, tool] of toolRegistry.tools) {
      console.log(`  • ${tool.name} (${toolId}) - ${tool.status}`);
    }
    console.log('');
  } catch (error) {
    console.error(`❌ Tool Registry initialization failed: ${error.message}`);
    return;
  }

  // Test 2: Register a custom tool
  console.log('🧪 Test 2: Custom Tool Registration\n');
  
  const customTool = {
    id: 'test_custom_tool',
    name: 'Test Custom Tool',
    description: 'A test tool for validation',
    category: 'testing',
    nodeRedFlowId: 'test_custom_flow',
    inputSchema: {
      type: 'object',
      properties: {
        testInput: { type: 'string' }
      },
      required: ['testInput']
    },
    outputSchema: {
      type: 'object',
      properties: {
        result: { type: 'string' }
      }
    },
    agentAccess: ['board-cao-001', 'exec-ceo-001'],
    status: 'active',
    version: '1.0.0',
    author: 'test',
    tags: ['test', 'validation']
  };

  try {
    const registeredTool = await toolRegistry.registerTool(customTool);
    console.log(`✅ Custom tool registered: ${registeredTool.name} (${registeredTool.id})`);
    console.log(`  Category: ${registeredTool.category}`);
    console.log(`  Status: ${registeredTool.status}`);
    console.log(`  Agent Access: ${registeredTool.agentAccess.join(', ')}`);
    console.log('');
  } catch (error) {
    console.error(`❌ Custom tool registration failed: ${error.message}`);
  }

  // Test 3: Tool execution (placeholder)
  console.log('🧪 Test 3: Tool Execution (Placeholder)\n');
  
  try {
    const result = await toolRegistry.executeTool('openai_json_schema', {
      model: 'gpt-4.1-mini',
      prompt: 'Test prompt',
      schema: { type: 'object', properties: { test: { type: 'string' } } }
    });
    
    console.log(`✅ Tool execution result:`);
    console.log(`  Success: ${result.success}`);
    console.log(`  Tool: ${result.toolName}`);
    console.log(`  Execution Time: ${result.executionTime}ms`);
    console.log(`  Execution ID: ${result.executionId}`);
    console.log('');
  } catch (error) {
    console.error(`❌ Tool execution failed: ${error.message}`);
  }

  // Test 4: Tool search and filtering
  console.log('🧪 Test 4: Tool Search and Filtering\n');
  
  // Search by query
  const searchResults = toolRegistry.searchTools('openai');
  console.log(`🔍 Search for 'openai': ${searchResults.length} results`);
  searchResults.forEach(tool => {
    console.log(`  • ${tool.name} (${tool.id})`);
  });
  console.log('');

  // Filter by category
  const researchTools = toolRegistry.getToolsByCategory('research');
  console.log(`🔍 Research tools: ${researchTools.length} results`);
  researchTools.forEach(tool => {
    console.log(`  • ${tool.name} (${tool.id})`);
  });
  console.log('');

  // Filter by agent access
  const toolsForAgent = toolRegistry.getToolsForAgent('board-cao-001');
  console.log(`🔍 Tools for board-cao-001: ${toolsForAgent.length} results`);
  toolsForAgent.forEach(tool => {
    console.log(`  • ${tool.name} (${tool.id})`);
  });
  console.log('');

  // Test 5: Tool statistics
  console.log('🧪 Test 5: Tool Statistics\n');
  
  const stats = toolRegistry.getRegistryStats();
  console.log('📊 Tool Registry Statistics:');
  console.log(`  Total Tools: ${stats.totalTools}`);
  console.log(`  Active Tools: ${stats.activeTools}`);
  console.log(`  Registered Tools: ${stats.registeredTools}`);
  console.log(`  Total Executions: ${stats.totalExecutions}`);
  console.log(`  Average Success Rate: ${(stats.totalSuccessRate * 100).toFixed(2)}%`);
  console.log(`  Categories: ${stats.categories}`);
  console.log(`  Average Execution Time: ${stats.averageExecutionTime.toFixed(2)}ms`);
  console.log('');

  // Test 6: Individual tool statistics
  console.log('🧪 Test 6: Individual Tool Statistics\n');
  
  const openaiToolStats = toolRegistry.getToolStats('openai_json_schema');
  if (openaiToolStats) {
    console.log('📊 OpenAI JSON Schema Tool Statistics:');
    console.log(`  Name: ${openaiToolStats.name}`);
    console.log(`  Execution Count: ${openaiToolStats.executionCount}`);
    console.log(`  Success Count: ${openaiToolStats.successCount}`);
    console.log(`  Failure Count: ${openaiToolStats.failureCount}`);
    console.log(`  Success Rate: ${(openaiToolStats.successRate * 100).toFixed(2)}%`);
    console.log(`  Average Execution Time: ${openaiToolStats.averageExecutionTime.toFixed(2)}ms`);
    console.log(`  Last Executed: ${openaiToolStats.lastExecuted || 'Never'}`);
    console.log('');
  }

  // Test 7: Category statistics
  console.log('🧪 Test 7: Category Statistics\n');
  
  console.log('📊 Category Statistics:');
  for (const [categoryName, category] of toolRegistry.categories) {
    console.log(`  ${categoryName}:`);
    console.log(`    Tools: ${category.tools.length}`);
    console.log(`    Total Executions: ${category.totalExecutions}`);
    console.log(`    Success Rate: ${(category.successRate * 100).toFixed(2)}%`);
    console.log(`    Average Execution Time: ${category.averageExecutionTime.toFixed(2)}ms`);
  }
  console.log('');

  // Test 8: Error handling
  console.log('🧪 Test 8: Error Handling\n');
  
  try {
    await toolRegistry.executeTool('non_existent_tool', {});
    console.log('❌ Should have thrown an error');
  } catch (error) {
    console.log(`✅ Error handled correctly: ${error.message}`);
  }

  try {
    await toolRegistry.executeTool('openai_json_schema', null);
    console.log('❌ Should have thrown an error');
  } catch (error) {
    console.log(`✅ Error handled correctly: ${error.message}`);
  }
  console.log('');

  console.log('🎉 Tool Registry Test Complete!\n');
  console.log('📋 Summary:');
  console.log(`  • Tools registered: ${toolRegistry.tools.size}`);
  console.log(`  • Categories: ${toolRegistry.categories.size}`);
  console.log(`  • Total executions: ${stats.totalExecutions}`);
  console.log(`  • Average success rate: ${(stats.totalSuccessRate * 100).toFixed(2)}%`);
  console.log('');
  console.log('🚀 Tool Registry is ready for integration with the agent system!');
  console.log('📋 Next step: Test agent-tool integration');
}

// Run the test if this file is executed directly
if (require.main === module) {
  testToolRegistry().catch(console.error);
}

module.exports = { testToolRegistry }; 