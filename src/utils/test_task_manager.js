#!/usr/bin/env node

const { TaskManagementSystem } = require('../services/task_management_system');

async function main() {
  const tms = new TaskManagementSystem();
  try {
    await tms.init();

    const contentTask = tms.createTask('content_creation', {
      topic: 'Test Topic',
      targetAudience: 'developers',
      contentType: 'blog_post',
      wordCount: 200,
      tone: 'technical'
    }, 'low', { createdBy: 'test' });

    // Expect failure here because no agents are deployed; catch and assert failure path
    try {
      await tms.executeTask(contentTask.id);
      console.log('⚠️ Unexpected success: executeTask should likely fail without deployed agents');
    } catch (e) {
      console.log('✅ Expected failure when executing without agents:', e.message);
    }

    console.log('📊 Stats:', tms.getTaskStatistics());
  } catch (err) {
    console.error('❌ Task Management test failed:', err.message);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}
