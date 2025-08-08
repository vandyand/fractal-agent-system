#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { NodeRedClient } = require('../services/node_red_client');

const WORKFLOWS_DIR = path.join(__dirname, '../workflows');
const SAFE_TYPES = new Set([
  'tab', 'http in', 'http response', 'http request', 'function', 'inject', 'switch', 'debug', 'file', 'catch'
]);

function loadAllFlows(dir) {
  const entries = fs.readdirSync(dir).filter(f => f.endsWith('.json'));
  const all = [];
  for (const file of entries) {
    try {
      const full = path.join(dir, file);
      const data = JSON.parse(fs.readFileSync(full, 'utf8'));
      if (Array.isArray(data)) {
        all.push({ file, nodes: data });
      }
    } catch (e) {
      console.warn(`Skipping invalid flow file ${file}: ${e.message}`);
    }
  }
  return all;
}

function mergeFlows(flowFiles, safeOnly) {
  const idToNode = new Map();
  for (const { file, nodes } of flowFiles) {
    for (const node of nodes) {
      if (!node || !node.id || !node.type) continue;
      if (safeOnly && !SAFE_TYPES.has(node.type)) continue;
      idToNode.set(node.id, node);
    }
  }
  return Array.from(idToNode.values());
}

async function main() {
  const nodeRedUrl = process.env.NODE_RED_URL || 'http://localhost:1880';
  const safeOnly = (process.env.FLOWS_SAFE_ONLY || 'true').toLowerCase() !== 'false';
  const client = new NodeRedClient(nodeRedUrl);

  try {
    await client.ensureAvailable();
    console.log(`✅ Node-RED available at ${nodeRedUrl}`);

    const flowFiles = loadAllFlows(WORKFLOWS_DIR);
    console.log(`📁 Found ${flowFiles.length} flow file(s)`);

    const merged = mergeFlows(flowFiles, safeOnly);
    console.log(`📦 Deploying ${merged.length} nodes (${safeOnly ? 'safe-only' : 'all types'})`);

    const res = await client.replaceFlows(merged);
    console.log(`✅ Deploy status: ${res.status}`);
  } catch (err) {
    console.error(`❌ Flow deployment failed: ${err.message}`);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}
