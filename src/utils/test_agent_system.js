#!/usr/bin/env node

/**
 * Test script for the Autonomous Digital Company Agent System
 * 
 * This script demonstrates the agent system functionality, including:
 * - Agent creation and registration
 * - Capability execution with placeholders
 * - Inter-agent communication
 * - Performance tracking
 * - OpenAI integration placeholders
 */

const { AgentFactory, AgentCommunicationHub } = require('../agents/agent_interfaces');

async function testAgentSystem() {
  console.log('🚀 Testing Autonomous Digital Company Agent System\n');

  // Create communication hub
  const hub = new AgentCommunicationHub();
  console.log('📡 Agent Communication Hub created\n');

  // Register key agents
  const agentIds = [
    'board-cao-001',      // Chief Autonomous Officer
    'board-cfo-001',      // Chief Financial Officer
    'board-cro-001',      // Chief Research Officer
    'exec-ceo-001',       // Chief Executive Officer
    'exec-cto-001',       // Chief Technology Officer
    'specialized-document-processor-001',  // Document Processing Agent
    'specialized-financial-analyst-001',   // Financial Analysis Agent
    'meta-performance-monitor-001'         // Performance Monitoring Agent
  ];

  console.log('🤖 Registering agents...');
  for (const agentId of agentIds) {
    await hub.registerAgent(agentId);
    console.log(`  ✅ Registered: ${agentId}`);
  }
  console.log('');

  // Test 1: Agent capability execution with placeholders
  console.log('🧪 Test 1: Agent Capability Execution (Placeholders)\n');

  const testCases = [
    {
      agentId: 'board-cao-001',
      capability: 'strategic_planning',
      data: { companyDirection: 'research-focused', marketFocus: 'AI services' }
    },
    {
      agentId: 'board-cfo-001',
      capability: 'financial_reporting',
      data: { period: 'Q1 2025', revenue: 50000, expenses: 30000 }
    },
    {
      agentId: 'specialized-document-processor-001',
      capability: 'multi_format_parsing',
      data: { documentUrl: 'https://example.com/research-paper.pdf', format: 'PDF' }
    },
    {
      agentId: 'specialized-financial-analyst-001',
      capability: 'real_time_market_analysis',
      data: { symbols: ['AAPL', 'GOOGL', 'MSFT'], timeframe: '1d' }
    }
  ];

  for (const testCase of testCases) {
    console.log(`📋 Testing ${testCase.agentId} - ${testCase.capability}`);
    try {
      const result = await hub.executeCapability(
        testCase.agentId,
        testCase.capability,
        testCase.data
      );
      console.log(`  Status: ${result.success ? '✅ Success' : '⚠️ Placeholder'}`);
      console.log(`  Message: ${result.message.substring(0, 100)}...`);
      console.log('');
    } catch (error) {
      console.log(`  ❌ Error: ${error.message}`);
      console.log('');
    }
  }

  // Test 2: Inter-agent communication
  console.log('🧪 Test 2: Inter-Agent Communication\n');

  const communicationTests = [
    {
      from: 'board-cao-001',
      to: 'exec-ceo-001',
      message: 'Strategic direction update required',
      data: { newStrategy: 'Focus on AI-powered research services' }
    },
    {
      from: 'exec-ceo-001',
      to: 'exec-cto-001',
      message: 'Technology infrastructure assessment needed',
      data: { requirements: ['Scalability', 'AI integration', 'Real-time processing'] }
    },
    {
      from: 'specialized-document-processor-001',
      to: 'board-cro-001',
      message: 'Research paper analysis complete',
      data: { paperId: 'research-123', findings: ['AI trends', 'Market opportunities'] }
    }
  ];

  for (const commTest of communicationTests) {
    console.log(`📞 ${commTest.from} → ${commTest.to}: ${commTest.message}`);
    try {
      const result = await hub.sendMessage(
        commTest.from,
        commTest.to,
        commTest.message,
        commTest.data
      );
      console.log(`  ✅ Communication sent (ID: ${result.communicationId})`);
    } catch (error) {
      console.log(`  ❌ Communication failed: ${error.message}`);
    }
  }
  console.log('');

  // Test 3: Performance tracking
  console.log('🧪 Test 3: Performance Tracking\n');

  // Simulate some performance metrics
  const agents = Array.from(hub.agents.values());
  for (const agent of agents) {
    // Track some sample metrics
    agent.trackPerformance('tasks_completed', Math.floor(Math.random() * 10) + 1);
    agent.trackPerformance('response_time_ms', Math.floor(Math.random() * 1000) + 100);
    agent.trackPerformance('accuracy_percentage', Math.floor(Math.random() * 20) + 80);
    
    console.log(`📊 ${agent.agentId} Performance Summary:`);
    const summary = agent.getPerformanceSummary();
    for (const [metric, data] of Object.entries(summary)) {
      console.log(`  ${metric}: ${data.current} (avg: ${data.average.toFixed(2)}, trend: ${data.trend})`);
    }
    console.log('');
  }

  // Test 4: Communication log
  console.log('🧪 Test 4: Communication Log\n');
  const communicationLog = hub.getCommunicationLog();
  console.log(`📋 Total communications: ${communicationLog.length}`);
  for (const comm of communicationLog) {
    console.log(`  ${comm.timestamp}: ${comm.from} → ${comm.to}: ${comm.message}`);
  }
  console.log('');

  // Test 5: Hub performance summary
  console.log('🧪 Test 5: Hub Performance Summary\n');
  const hubSummary = hub.getPerformanceSummary();
  console.log('📈 Hub Performance Summary:');
  for (const [agentId, summary] of Object.entries(hubSummary)) {
    console.log(`  ${agentId}: ${Object.keys(summary).length} metrics tracked`);
  }
  console.log('');

  // Test 6: Agent factory
  console.log('🧪 Test 6: Agent Factory\n');
  console.log('🏭 Available agent IDs:');
  const allAgentIds = AgentFactory.getAllAgentIds();
  for (const agentId of allAgentIds) {
    console.log(`  • ${agentId}`);
  }
  console.log('');

  // Test 7: Error handling
  console.log('🧪 Test 7: Error Handling\n');
  
  try {
    await hub.executeCapability('invalid-agent', 'invalid-capability', {});
    console.log('❌ Should have thrown an error');
  } catch (error) {
    console.log(`✅ Error handled correctly: ${error.message}`);
  }

  try {
    await hub.executeCapability('board-cao-001', 'invalid-capability', {});
    console.log('❌ Should have thrown an error');
  } catch (error) {
    console.log(`✅ Error handled correctly: ${error.message}`);
  }
  console.log('');

  console.log('🎉 Agent System Test Complete!\n');
  console.log('📋 Summary:');
  console.log(`  • Agents registered: ${hub.agents.size}`);
  console.log(`  • Communications logged: ${hub.getCommunicationLog().length}`);
  console.log(`  • Capabilities tested: ${testCases.length}`);
  console.log(`  • Performance metrics tracked: ${Object.keys(hub.getPerformanceSummary()).length}`);
  console.log('');
  console.log('🚀 The autonomous digital company agent system is ready for implementation!');
  console.log('📋 Next steps: Implement real capabilities based on the roadmap and backlog.');
}

// Run the test if this file is executed directly
if (require.main === module) {
  testAgentSystem().catch(console.error);
}

module.exports = { testAgentSystem }; 