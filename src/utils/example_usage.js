#!/usr/bin/env node

const FractalAgentCLI = require("./fractal_agent_cli");

/**
 * Example usage of the Fractal Agent CLI system
 * This demonstrates how to use the system programmatically
 */

async function exampleUsage() {
  console.log("🚀 Fractal Agent System - Programmatic Usage Example");
  console.log("===================================================\n");

  const cli = new FractalAgentCLI();

  try {
    // Initialize the system
    await cli.init();
    cli.loadState();

    // Example 1: Spawn multiple agents for a complex task
    console.log("📋 Example 1: Spawning Multiple Agents for Complex Task");
    console.log("------------------------------------------------------");

    const agents = [];

    // Spawn a schema generator agent
    const schemaAgentId = await cli.spawnAgent("schema_generator", [
      "json_schema",
      "validation",
    ]);
    agents.push({ id: schemaAgentId, type: "schema_generator" });
    console.log(`✅ Spawned schema agent: ${schemaAgentId}`);

    // Spawn a workflow generator agent
    const workflowAgentId = await cli.spawnAgent("workflow_generator", [
      "node_red",
      "automation",
    ]);
    agents.push({ id: workflowAgentId, type: "workflow_generator" });
    console.log(`✅ Spawned workflow agent: ${workflowAgentId}`);

    // Spawn an email processor agent
    const emailAgentId = await cli.spawnAgent("email_processor", [
      "sentiment_analysis",
      "response_generation",
    ]);
    agents.push({ id: emailAgentId, type: "email_processor" });
    console.log(`✅ Spawned email agent: ${emailAgentId}`);

    // Example 2: Run agents in sequence
    console.log("\n📋 Example 2: Running Agents in Sequence");
    console.log("----------------------------------------");

    // Run schema generator
    console.log("🔧 Running schema generator...");
    await cli.runAgent(schemaAgentId, {
      description:
        "A comprehensive schema for e-commerce product reviews including rating, sentiment, and purchase verification",
    });

    // Run workflow generator
    console.log("🔧 Running workflow generator...");
    await cli.runAgent(workflowAgentId, {
      request:
        "Create a workflow that processes customer orders, validates inventory, and sends confirmation emails",
    });

    // Run email processor
    console.log("🔧 Running email processor...");
    await cli.runAgent(emailAgentId, {
      email_content:
        "Thank you for your order! We're excited to ship your items. Please let us know if you have any questions.",
    });

    // Example 3: System monitoring
    console.log("\n📋 Example 3: System Monitoring");
    console.log("-------------------------------");

    console.log(`📊 Total agents deployed: ${cli.deployedAgents.size}`);
    console.log(`📊 Total spawn events: ${cli.spawnHistory.length}`);

    // Show recent spawn events
    const recentEvents = cli.spawnHistory.slice(-3);
    console.log("\n📜 Recent spawn events:");
    recentEvents.forEach((event, index) => {
      console.log(
        `  ${index + 1}. ${event.agent_type} agent spawned at ${
          event.timestamp
        }`
      );
    });

    // Example 4: Save and load system state
    console.log("\n📋 Example 4: State Management");
    console.log("------------------------------");

    const stateFile = `example_state_${Date.now()}.json`;
    cli.saveState(stateFile);
    console.log(`💾 System state saved to: ${stateFile}`);

    // Example 5: Agent capabilities analysis
    console.log("\n📋 Example 5: Agent Capabilities Analysis");
    console.log("------------------------------------------");

    const capabilities = new Map();
    cli.deployedAgents.forEach((agent, agentId) => {
      agent.capabilities.forEach((cap) => {
        if (!capabilities.has(cap)) {
          capabilities.set(cap, []);
        }
        capabilities.get(cap).push(agentId);
      });
    });

    console.log("🔧 Available capabilities:");
    capabilities.forEach((agents, capability) => {
      console.log(`  ${capability}: ${agents.length} agents`);
    });

    // Example 6: Fractal architecture demonstration
    console.log("\n📋 Example 6: Fractal Architecture");
    console.log("-----------------------------------");

    console.log("🔄 Demonstrating fractal agent spawning...");

    // Spawn a new agent from an existing agent (simulating fractal spawning)
    const fractalAgentId = await cli.spawnAgent("workflow_generator", [
      "fractal_spawning",
      "recursive_automation",
    ]);
    console.log(`🔄 Fractal agent spawned: ${fractalAgentId}`);

    // The new agent could theoretically spawn more agents
    console.log(
      "🔄 This agent could spawn more agents, creating a fractal pattern..."
    );

    console.log("\n🎉 Example completed successfully!");
    console.log("==================================");
    console.log("The fractal agent system demonstrates:");
    console.log("✅ Autonomous agent spawning");
    console.log("✅ Workflow automation");
    console.log("✅ State persistence");
    console.log("✅ Fractal architecture");
    console.log("✅ Real-time monitoring");
  } catch (error) {
    console.error(`❌ Example failed: ${error.message}`);
  } finally {
    // Save final state
    cli.saveState();
  }
}

// Run the example
if (require.main === module) {
  exampleUsage().catch(console.error);
}

module.exports = { exampleUsage };
