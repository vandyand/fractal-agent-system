#!/usr/bin/env node

const FractalAgentCLI = require("./fractal_agent_cli");

class DemoRunner {
  constructor() {
    this.cli = new FractalAgentCLI();
  }

  async run() {
    console.log("🎬 Fractal Agent System Demo");
    console.log("============================\n");

    try {
      // Initialize the CLI
      await this.cli.init();

      // Demo 1: Spawn a schema generator agent
      console.log("\n🎯 Demo 1: Spawning Schema Generator Agent");
      console.log("-------------------------------------------");
      const schemaAgentId = await this.cli.spawnAgent("schema_generator", [
        "json_schema",
        "validation",
      ]);
      console.log(`✅ Schema agent spawned: ${schemaAgentId}`);

      // Demo 2: Spawn a workflow generator agent
      console.log("\n🎯 Demo 2: Spawning Workflow Generator Agent");
      console.log("---------------------------------------------");
      const workflowAgentId = await this.cli.spawnAgent("workflow_generator", [
        "node_red",
        "automation",
      ]);
      console.log(`✅ Workflow agent spawned: ${workflowAgentId}`);

      // Demo 3: Spawn an email processor agent
      console.log("\n🎯 Demo 3: Spawning Email Processor Agent");
      console.log("------------------------------------------");
      const emailAgentId = await this.cli.spawnAgent("email_processor", [
        "sentiment_analysis",
        "response_generation",
      ]);
      console.log(`✅ Email agent spawned: ${emailAgentId}`);

      // Demo 4: Run the schema generator agent
      console.log("\n🎯 Demo 4: Running Schema Generator Agent");
      console.log("------------------------------------------");
      const schemaInput = {
        description:
          "A schema for customer feedback that includes rating, sentiment, and improvement suggestions",
      };
      await this.cli.runAgent(schemaAgentId, schemaInput);

      // Demo 5: Run the workflow generator agent
      console.log("\n🎯 Demo 5: Running Workflow Generator Agent");
      console.log("--------------------------------------------");
      const workflowInput = {
        request:
          "Create a workflow that processes customer orders and sends confirmation emails",
      };
      await this.cli.runAgent(workflowAgentId, workflowInput);

      // Demo 6: Show all deployed agents
      console.log("\n🎯 Demo 6: Listing All Deployed Agents");
      console.log("-------------------------------------");
      this.cli.listAgents();

      // Demo 7: Show spawn history
      console.log("\n🎯 Demo 7: Spawn History");
      console.log("----------------------");
      this.cli.showHistory();

      // Demo 8: Save system state
      console.log("\n🎯 Demo 8: Saving System State");
      console.log("-----------------------------");
      this.cli.saveState("demo_system_state.json");

      console.log("\n🎉 Demo completed successfully!");
      console.log("===============================");
      console.log("The fractal agent system is now running with:");
      console.log(`- ${this.cli.deployedAgents.size} deployed agents`);
      console.log(`- ${this.cli.spawnHistory.length} spawn events recorded`);
      console.log("- System state saved to demo_system_state.json");
    } catch (error) {
      console.error(`❌ Demo failed: ${error.message}`);
      process.exit(1);
    }
  }

  async runInteractiveDemo() {
    console.log("🎮 Interactive Fractal Agent Demo");
    console.log("=================================\n");

    try {
      await this.cli.init();

      const readline = require("readline");
      const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
      });

      const question = (query) =>
        new Promise((resolve) => rl.question(query, resolve));

      console.log("Welcome to the interactive demo! You can:");
      console.log("1. Spawn agents");
      console.log("2. Run agents");
      console.log("3. View system status");
      console.log("4. Exit\n");

      while (true) {
        const action = await question("What would you like to do? (1-4): ");

        switch (action) {
          case "1":
            const agentType = await question(
              "Enter agent type (email_processor/schema_generator/workflow_generator): "
            );
            const capabilities = await question(
              "Enter capabilities (comma-separated): "
            );
            const capArray = capabilities.split(",").map((c) => c.trim());

            try {
              const agentId = await this.cli.spawnAgent(agentType, capArray);
              console.log(`✅ Agent spawned: ${agentId}`);
            } catch (error) {
              console.error(`❌ Failed to spawn agent: ${error.message}`);
            }
            break;

          case "2":
            this.cli.listAgents();
            const agentId = await question("Enter agent ID to run: ");
            const input = await question("Enter input data (JSON): ");

            try {
              const inputData = input ? JSON.parse(input) : {};
              await this.cli.runAgent(agentId, inputData);
            } catch (error) {
              console.error(`❌ Failed to run agent: ${error.message}`);
            }
            break;

          case "3":
            this.cli.listAgents();
            this.cli.showHistory();
            break;

          case "4":
            console.log("👋 Thanks for trying the demo!");
            rl.close();
            return;

          default:
            console.log("❌ Invalid option. Please choose 1-4.");
        }
      }
    } catch (error) {
      console.error(`❌ Interactive demo failed: ${error.message}`);
    }
  }
}

// Run the demo
async function main() {
  const demo = new DemoRunner();
  const args = process.argv.slice(2);

  if (args.includes("--interactive") || args.includes("-i")) {
    await demo.runInteractiveDemo();
  } else {
    await demo.run();
  }
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = DemoRunner;
