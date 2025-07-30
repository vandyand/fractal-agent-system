#!/usr/bin/env node

const { ResourceRegistry } = require('../services/resource_registry');

async function testResourceRegistry() {
  console.log('🧪 Testing Resource Registry...\n');
  
  // Initialize resource registry
  const registry = new ResourceRegistry({
    basePath: './data/resources',
    enableVersioning: true,
    enableAccessControl: true
  });
  
  try {
    // Test 1: Register a resource
    console.log('📝 Test 1: Registering a resource...');
    const resource1 = await registry.registerResource({
      name: 'Company Strategy Document',
      type: 'document',
      content: 'Our autonomous digital company strategy focuses on AI-driven business processes and automated revenue generation.',
      agentId: 'strategy_planner',
      accessLevel: 'public',
      tags: ['strategy', 'business', 'planning']
    });
    console.log(`✅ Resource registered: ${resource1.name} (${resource1.id})\n`);
    
    // Test 2: Register another resource
    console.log('📝 Test 2: Registering another resource...');
    const resource2 = await registry.registerResource({
      name: 'Market Analysis Report',
      type: 'report',
      content: 'Current market analysis shows high demand for AI-powered business automation services.',
      agentId: 'market_analyst',
      accessLevel: 'public',
      tags: ['market', 'analysis', 'report']
    });
    console.log(`✅ Resource registered: ${resource2.name} (${resource2.id})\n`);
    
    // Test 3: Search resources
    console.log('🔍 Test 3: Searching resources...');
    const searchResults = await registry.searchResources('strategy', {
      type: 'document',
      accessLevel: 'public'
    });
    console.log(`✅ Found ${searchResults.length} resources matching 'strategy'\n`);
    
    // Test 4: Get resource by ID
    console.log('📖 Test 4: Getting resource by ID...');
    const retrievedResource = await registry.getResource(resource1.id, 'strategy_planner');
    console.log(`✅ Retrieved resource: ${retrievedResource.name}\n`);
    
    // Test 5: Update resource
    console.log('✏️ Test 5: Updating resource...');
    const updatedResource = await registry.updateResource(resource1.id, {
      content: 'Updated strategy: Our autonomous digital company strategy focuses on AI-driven business processes, automated revenue generation, and real-time market adaptation.',
      tags: ['strategy', 'business', 'planning', 'updated']
    }, 'strategy_planner');
    console.log(`✅ Resource updated: ${updatedResource.name} (v${updatedResource.version})\n`);
    
    // Test 6: Share resource
    console.log('📤 Test 6: Sharing resource...');
    await registry.shareResource(resource1.id, 'business_executor', 'read');
    console.log(`✅ Resource shared with business_executor\n`);
    
    // Test 7: Get statistics
    console.log('📊 Test 7: Getting statistics...');
    const stats = registry.getStats();
    console.log('✅ Resource Registry Statistics:');
    console.log(`   Total Resources: ${stats.totalResources}`);
    console.log(`   Total Size: ${stats.totalSize} bytes`);
    console.log(`   By Type:`, stats.byType);
    console.log(`   By Agent:`, stats.byAgent);
    console.log(`   By Access Level:`, stats.byAccessLevel);
    console.log(`   Locked Resources: ${stats.lockedResources}\n`);
    
    // Test 8: Lock and unlock resource
    console.log('🔒 Test 8: Testing resource locking...');
    const lock = await registry.lockResource(resource1.id, 'strategy_planner', 30000);
    console.log(`✅ Resource locked by strategy_planner`);
    
    await registry.unlockResource(resource1.id, 'strategy_planner');
    console.log(`✅ Resource unlocked\n`);
    
    console.log('🎉 All tests passed! Resource Registry is working correctly.');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error(error.stack);
  }
}

// Run the test
testResourceRegistry(); 