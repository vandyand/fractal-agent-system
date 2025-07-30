#!/usr/bin/env node

const FractalAgentCLI = require("./fractal_agent_cli");

class RealityCheck {
  constructor() {
    this.cli = new FractalAgentCLI();
  }

  async init() {
    console.log("🔍 REALITY CHECK - What Do Our Agents Actually Do?");
    console.log("==================================================\n");

    await this.cli.init();
    this.cli.loadState();
  }

  async testEmailProcessor() {
    console.log("📧 Testing Email Processor Agent");
    console.log("--------------------------------");

    const testEmail =
      "I am very unhappy with your service. The product arrived damaged and customer support was unhelpful.";

    console.log(`Input: ${testEmail}`);
    console.log("Expected: Sentiment analysis and response generation");
    console.log("Reality: Let's see what actually happens...\n");

    // Find an email processor agent
    const agents = Array.from(this.cli.deployedAgents.entries());
    const emailAgent = agents.find(
      ([id, agent]) => agent.type === "email_processor"
    );

    if (emailAgent) {
      console.log(`Found email agent: ${emailAgent[0]}`);
      console.log("Running agent...\n");

      try {
        await this.cli.runAgent(emailAgent[0], {
          email_content: testEmail,
        });

        console.log("✅ Agent executed successfully");
        console.log("📝 Check Node-RED debug panel for actual output");
        console.log("🔍 The agent should have:");
        console.log("   - Analyzed the email sentiment");
        console.log("   - Generated a response via OpenAI");
        console.log("   - Output the result to debug panel");
      } catch (error) {
        console.error(`❌ Agent execution failed: ${error.message}`);
      }
    } else {
      console.log("❌ No email processor agent found");
    }
  }

  async testSchemaGenerator() {
    console.log("\n📋 Testing Schema Generator Agent");
    console.log("--------------------------------");

    const testDescription =
      "A schema for customer feedback that includes rating, sentiment, and improvement suggestions";

    console.log(`Input: ${testDescription}`);
    console.log("Expected: Valid JSON schema");
    console.log("Reality: Let's see what actually happens...\n");

    // Find a schema generator agent
    const agents = Array.from(this.cli.deployedAgents.entries());
    const schemaAgent = agents.find(
      ([id, agent]) => agent.type === "schema_generator"
    );

    if (schemaAgent) {
      console.log(`Found schema agent: ${schemaAgent[0]}`);
      console.log("Running agent...\n");

      try {
        await this.cli.runAgent(schemaAgent[0], {
          description: testDescription,
        });

        console.log("✅ Agent executed successfully");
        console.log("📝 Check Node-RED debug panel for actual schema output");
        console.log("🔍 The agent should have:");
        console.log("   - Generated a JSON schema via OpenAI");
        console.log("   - Output the schema to debug panel");
      } catch (error) {
        console.error(`❌ Agent execution failed: ${error.message}`);
      }
    } else {
      console.log("❌ No schema generator agent found");
    }
  }

  async testWorkflowGenerator() {
    console.log("\n🔄 Testing Workflow Generator Agent");
    console.log("-----------------------------------");

    const testRequest =
      "Create a workflow that processes customer orders and sends confirmation emails";

    console.log(`Input: ${testRequest}`);
    console.log("Expected: Node-RED workflow JSON");
    console.log("Reality: Let's see what actually happens...\n");

    // Find a workflow generator agent
    const agents = Array.from(this.cli.deployedAgents.entries());
    const workflowAgent = agents.find(
      ([id, agent]) => agent.type === "workflow_generator"
    );

    if (workflowAgent) {
      console.log(`Found workflow agent: ${workflowAgent[0]}`);
      console.log("Running agent...\n");

      try {
        await this.cli.runAgent(workflowAgent[0], {
          request: testRequest,
        });

        console.log("✅ Agent executed successfully");
        console.log("📝 Check Node-RED debug panel for actual workflow JSON");
        console.log("🔍 The agent should have:");
        console.log("   - Generated a Node-RED workflow via OpenAI");
        console.log("   - Output the workflow JSON to debug panel");
      } catch (error) {
        console.error(`❌ Agent execution failed: ${error.message}`);
      }
    } else {
      console.log("❌ No workflow generator agent found");
    }
  }

  async showRealCapabilities() {
    console.log("\n🎯 REAL CAPABILITIES vs FAKE CAPABILITIES");
    console.log("==========================================");

    console.log("\n✅ WHAT WE ACTUALLY HAVE:");
    console.log("1. Node-RED workflow deployment ✅");
    console.log("2. OpenAI API integration ✅");
    console.log("3. Agent spawning mechanism ✅");
    console.log("4. State persistence ✅");
    console.log("5. Node triggering via REST API ✅");

    console.log("\n❌ WHAT WE DON'T HAVE (YET):");
    console.log("1. Real customer support system ❌");
    console.log("2. Real inventory management ❌");
    console.log("3. Real financial tracking ❌");
    console.log("4. Real email processing ❌");
    console.log("5. Real business metrics ❌");

    console.log("\n🔧 WHAT WE NEED TO BUILD:");
    console.log("1. Connect to real business systems");
    console.log("2. Implement actual email processing");
    console.log("3. Add real inventory APIs");
    console.log("4. Integrate with financial systems");
    console.log("5. Build real customer support workflows");
  }

  async run() {
    await this.init();

    console.log("🤖 Current Deployed Agents:");
    this.cli.listAgents();

    await this.testEmailProcessor();
    await this.testSchemaGenerator();
    await this.testWorkflowGenerator();
    await this.showRealCapabilities();

    console.log("\n🎯 CONCLUSION:");
    console.log("==============");
    console.log("We have a working AUTOMATION FRAMEWORK that can:");
    console.log("✅ Deploy Node-RED workflows");
    console.log("✅ Trigger OpenAI API calls");
    console.log("✅ Spawn new agents");
    console.log("✅ Persist system state");
    console.log("");
    console.log("But we need to connect it to REAL BUSINESS SYSTEMS");
    console.log("to make it actually useful for real business tasks.");
  }
}

// Run the reality check
async function main() {
  const realityCheck = new RealityCheck();
  await realityCheck.run();
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = { RealityCheck };
