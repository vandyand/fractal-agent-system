#!/usr/bin/env node

/* Minimal test runner: loads key modules to catch syntax and import errors.
   Does not perform network calls. Exits non-zero on failure. */

function requireSafe(modulePath) {
  try {
    require(modulePath);
    console.log(`OK  - ${modulePath}`);
  } catch (err) {
    console.error(`ERR - ${modulePath}: ${err.message}`);
    process.exitCode = 1;
  }
}

const modules = [
  './local_email_test.js',
  '../src/index.js',
  '../src/agents/fractal_agent_cli.js',
  '../src/agents/agent_communication_protocol.js',
  '../src/services/tool_registry.js',
  '../src/services/task_management_system.js',
  '../src/services/email_integration_system.js',
  '../src/services/enhanced_email_system.js',
  '../src/services/resource_registry.js',
  '../src/utils/fractal_system_entry.js',
];

console.log('Running minimal module load tests...');
modules.forEach(requireSafe);

process.on('beforeExit', (code) => {
  if (code === 0) console.log('All module load tests passed.');
});
