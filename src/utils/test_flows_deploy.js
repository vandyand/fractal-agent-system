#!/usr/bin/env node

// Simple flow deployment test: deploys an example flow from src/workflows/openai_json_schema.json
// Requires Node-RED running at NODE_RED_URL or http://localhost:1880

const fs = require('fs');
const path = require('path');
const { NodeRedClient } = require('../services/node_red_client');

async function main() {
  const nodeRedUrl = process.env.NODE_RED_URL || 'http://localhost:1880';
  const client = new NodeRedClient(nodeRedUrl);
  const flowPath = path.join(__dirname, '../workflows/openai_json_schema.json');

  try {
    await client.ensureAvailable();
    console.log(`✅ Node-RED available at ${nodeRedUrl}`);

    const flow = JSON.parse(fs.readFileSync(flowPath, 'utf8'));
    console.log(`📦 Deploying flow from ${flowPath} (nodes: ${flow.length})`);
    const res = await client.replaceFlows(flow);
    console.log(`✅ Deploy status: ${res.status}`);
    console.log('Done');
  } catch (err) {
    console.error(`❌ Deployment test failed: ${err.message}`);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}
