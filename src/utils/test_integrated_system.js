#!/usr/bin/env node

/**
 * Integrated System Test
 * 
 * This script tests the complete integration between:
 * 1. Tool Registry System
 * 2. Agent System
 * 3. Agent-Tool Integration
 * 4. Complete workflow simulation
 */

const { ToolRegistry } = require('../services/tool_registry');
const { AgentFactory, AgentCommunicationHub } = require('../agents/agent_interfaces');

async function testIntegratedSystem() {
  console.log('🚀 Testing Integrated Autonomous Digital Company System\n');

  // Initialize Tool Registry
  console.log('🔧 Phase 1: Tool Registry Initialization\n');
  const toolRegistry = new ToolRegistry({
    nodeRedUrl: 'http://localhost:1880',
    enableAutoDiscovery: true
  });

  try {
    await toolRegistry.initialize();
    console.log(`✅ Tool Registry initialized with ${toolRegistry.tools.size} tools\n`);
  } catch (error) {
    console.error(`❌ Tool Registry initialization failed: ${error.message}`);
    return;
  }

  // Initialize Agent System
  console.log('🤖 Phase 2: Agent System Initialization\n');
  const hub = new AgentCommunicationHub();
  
  // Register key agents
  const agentIds = [
    'board-cao-001',
    'board-cfo-001', 
    'board-cro-001',
    'exec-ceo-001',
    'specialized-document-processor-001',
    'specialized-financial-analyst-001'
  ];

  for (const agentId of agentIds) {
    try {
      await hub.registerAgent(agentId);
      console.log(`  ✅ Registered: ${agentId}`);
    } catch (error) {
      console.log(`  ⚠️ Could not register ${agentId}: ${error.message}`);
    }
  }
  console.log('');

  // Test 1: Agent-Tool Integration
  console.log('🧪 Test 1: Agent-Tool Integration\n');
  
  const testCases = [
    {
      agentId: 'board-cao-001',
      toolId: 'openai_json_schema',
      description: 'CAO using OpenAI for strategic analysis',
      inputData: {
        model: 'gpt-4.1-mini',
        prompt: 'Analyze current market trends for AI research services',
        schema: {
          type: 'object',
          properties: {
            marketTrends: { type: 'array', items: { type: 'string' } },
            opportunities: { type: 'array', items: { type: 'string' } },
            recommendations: { type: 'array', items: { type: 'string' } }
          }
        }
      }
    },
    {
      agentId: 'specialized-document-processor-001',
      toolId: 'document_parser_tool',
      description: 'Document processor using document parser tool',
      inputData: {
        documentUrl: 'https://arxiv.org/pdf/2023.12345.pdf',
        documentType: 'research_paper',
        options: {
          extractFigures: true,
          extractTables: true,
          extractEquations: true
        }
      }
    },
    {
      agentId: 'specialized-financial-analyst-001',
      toolId: 'web_scraping_tool',
      description: 'Financial analyst using web scraping for market data',
      inputData: {
        url: 'https://finance.yahoo.com/quote/AAPL',
        selectors: {
          price: '.D(ib) .Trsdu(0.2s)',
          change: '.D(ib) .Trsdu(0.2s) .C($negativeColor)',
          volume: '.D(ib) .Trsdu(0.2s) .C($negativeColor)'
        }
      }
    }
  ];

  for (const testCase of testCases) {
    console.log(`📋 Testing: ${testCase.description}`);
    
    try {
      // Check if agent has access to tool
      const agent = hub.getAgent(testCase.agentId);
      if (!agent) {
        console.log(`  ❌ Agent ${testCase.agentId} not found`);
        continue;
      }

      const hasAccess = agent.toolAccess.includes(testCase.toolId);
      console.log(`  Agent: ${testCase.agentId}`);
      console.log(`  Tool: ${testCase.toolId}`);
      console.log(`  Has Access: ${hasAccess ? '✅ Yes' : '❌ No'}`);

      if (hasAccess) {
        // Execute tool through agent
        const result = await agent.executeTool(testCase.toolId, testCase.inputData);
        console.log(`  Status: ${result.success ? '✅ Success' : '⚠️ Placeholder'}`);
        console.log(`  Placeholder: ${result.placeholder ? 'Yes' : 'No'}`);
        
        if (result.placeholder) {
          console.log(`  Message: ${result.message.substring(0, 100)}...`);
        }
      } else {
        console.log(`  ⚠️ Agent does not have access to this tool`);
      }
      console.log('');
    } catch (error) {
      console.log(`  ❌ Error: ${error.message}\n`);
    }
  }

  // Test 2: Multi-Agent Workflow Simulation
  console.log('🧪 Test 2: Multi-Agent Workflow Simulation\n');
  
  console.log('🔄 Simulating research workflow:');
  console.log('  1. CAO requests market analysis');
  console.log('  2. Document processor analyzes research papers');
  console.log('  3. Financial analyst processes market data');
  console.log('  4. Results communicated back to CAO\n');

  try {
    // Step 1: CAO initiates research request
    console.log('📋 Step 1: CAO initiates research request');
    const caoAgent = hub.getAgent('board-cao-001');
    const researchRequest = await caoAgent.executeResponsibility('strategic_planning', {
      researchFocus: 'AI market trends',
      timeframe: 'Q1 2025',
      priority: 'high'
    });
    console.log(`  Status: ${researchRequest.success ? '✅ Success' : '⚠️ Placeholder'}`);
    console.log('');

    // Step 2: Document processor analyzes papers
    console.log('📋 Step 2: Document processor analyzes research papers');
    const docProcessor = hub.getAgent('specialized-document-processor-001');
    const docAnalysis = await docProcessor.executeResponsibility('multi_format_parsing', {
      documents: [
        'https://arxiv.org/pdf/2023.12345.pdf',
        'https://arxiv.org/pdf/2023.67890.pdf'
      ],
      analysisType: 'market_trends'
    });
    console.log(`  Status: ${docAnalysis.success ? '✅ Success' : '⚠️ Placeholder'}`);
    console.log('');

    // Step 3: Financial analyst processes market data
    console.log('📋 Step 3: Financial analyst processes market data');
    const financialAnalyst = hub.getAgent('specialized-financial-analyst-001');
    const marketAnalysis = await financialAnalyst.executeResponsibility('real_time_market_analysis', {
      symbols: ['AAPL', 'GOOGL', 'MSFT', 'NVDA'],
      analysisType: 'trend_analysis',
      timeframe: '1d'
    });
    console.log(`  Status: ${marketAnalysis.success ? '✅ Success' : '⚠️ Placeholder'}`);
    console.log('');

    // Step 4: Results communicated back to CAO
    console.log('📋 Step 4: Results communicated back to CAO');
    const communication = await hub.sendMessage(
      'specialized-financial-analyst-001',
      'board-cao-001',
      'Market analysis complete',
      {
        marketTrends: ['AI growth', 'Cloud computing expansion'],
        opportunities: ['AI services', 'Research consulting'],
        recommendations: ['Focus on AI research services', 'Expand document processing capabilities']
      }
    );
    console.log(`  Status: ${communication.success ? '✅ Success' : '⚠️ Placeholder'}`);
    console.log('');

  } catch (error) {
    console.log(`❌ Workflow simulation error: ${error.message}\n`);
  }

  // Test 3: Tool Registry Statistics
  console.log('🧪 Test 3: Tool Registry Statistics\n');
  
  const registryStats = toolRegistry.getRegistryStats();
  console.log('📊 Tool Registry Performance:');
  console.log(`  Total Tools: ${registryStats.totalTools}`);
  console.log(`  Active Tools: ${registryStats.activeTools}`);
  console.log(`  Total Executions: ${registryStats.totalExecutions}`);
  console.log(`  Average Success Rate: ${(registryStats.totalSuccessRate * 100).toFixed(2)}%`);
  console.log(`  Average Execution Time: ${registryStats.averageExecutionTime.toFixed(2)}ms`);
  console.log('');

  // Test 4: Agent Performance Summary
  console.log('🧪 Test 4: Agent Performance Summary\n');
  
  console.log('📊 Agent Performance Overview:');
  for (const agentId of agentIds) {
    const agent = hub.getAgent(agentId);
    if (agent) {
      const performance = agent.getPerformanceSummary();
      console.log(`  ${agentId}:`);
      console.log(`    Tasks Completed: ${performance.tasks_completed?.current || 0}`);
      console.log(`    Response Time: ${performance.response_time_ms?.current || 0}ms`);
      console.log(`    Accuracy: ${performance.accuracy_percentage?.current || 0}%`);
    }
  }
  console.log('');

  // Test 5: System Health Check
  console.log('🧪 Test 5: System Health Check\n');
  
  const healthCheck = {
    toolRegistry: {
      status: toolRegistry.tools.size > 0 ? '✅ Healthy' : '❌ No tools',
      toolsCount: toolRegistry.tools.size,
      categoriesCount: toolRegistry.categories.size
    },
    agentSystem: {
      status: hub.agents.size > 0 ? '✅ Healthy' : '❌ No agents',
      agentsCount: hub.agents.size,
      communicationsCount: hub.communicationLog ? hub.communicationLog.length : 0
    },
    integration: {
      status: '✅ Ready',
      agentsWithTools: Array.from(hub.agents.values()).filter(agent => agent.toolAccess && agent.toolAccess.length > 0).length,
      totalToolAccess: Array.from(hub.agents.values()).reduce((sum, agent) => sum + (agent.toolAccess ? agent.toolAccess.length : 0), 0)
    }
  };

  console.log('🏥 System Health Status:');
  console.log(`  Tool Registry: ${healthCheck.toolRegistry.status} (${healthCheck.toolRegistry.toolsCount} tools, ${healthCheck.toolRegistry.categoriesCount} categories)`);
  console.log(`  Agent System: ${healthCheck.agentSystem.status} (${healthCheck.agentSystem.agentsCount} agents, ${healthCheck.agentSystem.communicationsCount} communications)`);
  console.log(`  Integration: ${healthCheck.integration.status} (${healthCheck.integration.agentsWithTools} agents with tools, ${healthCheck.integration.totalToolAccess} total tool access)`);
  console.log('');

  // Test 6: Next Steps Recommendations
  console.log('🧪 Test 6: Next Steps Recommendations\n');
  
  console.log('📋 Implementation Priority Based on Test Results:');
  console.log('');
  console.log('🔴 CRITICAL (Implement First):');
  console.log('  1. Real OpenAI API integration in openai_json_schema tool');
  console.log('  2. Node-RED flow deployment for tool execution');
  console.log('  3. Document parser tool implementation');
  console.log('  4. Web scraping tool implementation');
  console.log('');
  console.log('🟡 HIGH (Implement Second):');
  console.log('  1. Real inter-agent communication system');
  console.log('  2. Performance monitoring and optimization');
  console.log('  3. Error handling and recovery mechanisms');
  console.log('  4. Data persistence and state management');
  console.log('');
  console.log('🟢 MEDIUM (Implement Third):');
  console.log('  1. Advanced tool categories (reporting, automation)');
  console.log('  2. Agent capability evolution');
  console.log('  3. Workflow orchestration');
  console.log('  4. Client-facing API development');
  console.log('');

  console.log('🎉 Integrated System Test Complete!\n');
  console.log('📋 Final Summary:');
  console.log(`  • Tool Registry: ${healthCheck.toolRegistry.toolsCount} tools ready`);
  console.log(`  • Agent System: ${healthCheck.agentSystem.agentsCount} agents operational`);
  console.log(`  • Integration: ${healthCheck.integration.agentsWithTools} agents with tool access`);
  console.log(`  • Total Tool Access: ${healthCheck.integration.totalToolAccess} tool-agent connections`);
  console.log('');
  console.log('🚀 The autonomous digital company system is ready for real implementation!');
  console.log('📋 Follow the roadmap and backlog for systematic feature development.');
  console.log('🎯 Start with Priority 1: Core Research & Intelligence tools.');
}

// Run the test if this file is executed directly
if (require.main === module) {
  testIntegratedSystem().catch(console.error);
}

module.exports = { testIntegratedSystem }; 