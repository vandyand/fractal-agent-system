#!/usr/bin/env node

/**
 * Test Web Search Integration with OpenAI Responses API
 * 
 * This script tests the web-enabled LLM responses using gpt-4.1-mini
 * with the web_search_preview tool.
 */

const { ToolRegistry } = require('../services/tool_registry');

async function testWebSearch() {
  console.log('🌐 Testing Web Search Integration with OpenAI Responses API\n');
  console.log('========================================================\n');

  const toolRegistry = new ToolRegistry();
  await toolRegistry.initialize();

  // Test cases for web search
  const testCases = [
    {
      name: 'Current News Test',
      prompt: 'What are the latest developments in AI technology from the past week?',
      enableWebSearch: true,
      expectedSchema: {
        type: 'object',
        properties: {
          summary: { type: 'string' },
          keyDevelopments: { type: 'array', items: { type: 'string' } },
          sources: { type: 'array', items: { type: 'string' } }
        }
      }
    },
    {
      name: 'Market Analysis Test',
      prompt: 'What is the current state of the cryptocurrency market?',
      enableWebSearch: true,
      expectedSchema: {
        type: 'object',
        properties: {
          marketOverview: { type: 'string' },
          topPerformers: { type: 'array', items: { type: 'string' } },
          marketTrends: { type: 'string' }
        }
      }
    },
    {
      name: 'Regular Query (No Web Search)',
      prompt: 'Explain the concept of machine learning in simple terms',
      enableWebSearch: false,
      expectedSchema: {
        type: 'object',
        properties: {
          explanation: { type: 'string' },
          examples: { type: 'array', items: { type: 'string' } }
        }
      }
    }
  ];

  for (const testCase of testCases) {
    try {
      console.log(`🧪 Testing: ${testCase.name}`);
      console.log(`   Query: "${testCase.prompt}"`);
      console.log(`   Web Search: ${testCase.enableWebSearch ? 'Enabled' : 'Disabled'}`);
      
      const startTime = Date.now();
      
      const result = await toolRegistry.executeDirectOpenAICall({
        model: 'gpt-4.1-mini',
        prompt: testCase.prompt,
        schema: testCase.expectedSchema,
        enableWebSearch: testCase.enableWebSearch,
        temperature: 0.7,
        maxTokens: 1500,
        taskType: 'analysis'
      });

      const executionTime = Date.now() - startTime;
      
      console.log(`   ✅ Success!`);
      console.log(`   Execution Time: ${executionTime}ms`);
      console.log(`   API Execution Time: ${result.executionTime}ms`);
      console.log(`   Tokens Used: ${result.usage.totalTokens}`);
      console.log(`   Web Search Enabled: ${result.webSearchEnabled}`);
      console.log(`   Web Sources Found: ${result.webSources}`);
      
      if (result.webSources > 0) {
        console.log(`   📚 Web Sources:`);
        result.data.webSources.forEach((source, index) => {
          console.log(`      ${index + 1}. ${source.title} (${source.url})`);
        });
      }
      
      console.log(`   Response Preview: ${JSON.stringify(result.data).substring(0, 200)}...`);
      console.log('');
      
    } catch (error) {
      console.log(`   ❌ Failed: ${error.message}`);
      console.log('');
    }
  }

  // Performance comparison
  console.log('📊 Performance Comparison');
  console.log('========================');
  
  const performanceTest = async (enableWebSearch) => {
    const startTime = Date.now();
    try {
      await toolRegistry.executeDirectOpenAICall({
        model: 'gpt-4.1-mini',
        prompt: 'What is the weather like today?',
        enableWebSearch: enableWebSearch,
        temperature: 0.7,
        maxTokens: 500,
        taskType: 'simple_query'
      });
      return Date.now() - startTime;
    } catch (error) {
      return -1; // Error
    }
  };

  console.log('Testing response times...');
  const regularTime = await performanceTest(false);
  const webSearchTime = await performanceTest(true);
  
  console.log(`Regular Query: ${regularTime}ms`);
  console.log(`Web Search Query: ${webSearchTime}ms`);
  if (regularTime > 0 && webSearchTime > 0) {
    const difference = webSearchTime - regularTime;
    console.log(`Difference: ${difference}ms (${difference > 0 ? '+' : ''}${((difference / regularTime) * 100).toFixed(1)}%)`);
  }
  
  console.log('\n🎉 Web Search Integration Test Complete!');
}

// Run the test
if (require.main === module) {
  testWebSearch().catch(console.error);
}

module.exports = { testWebSearch }; 