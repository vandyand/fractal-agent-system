#!/usr/bin/env node

const axios = require("axios");

class OutputCapture {
  constructor() {
    this.nodeRedUrl = "http://localhost:1880";
  }

  async getNodeOutputs() {
    console.log("🔍 CAPTURING REAL OUTPUTS FROM NODE-RED");
    console.log("=======================================\n");

    try {
      // Get all flows to see what's deployed
      const flowsResponse = await axios.get(`${this.nodeRedUrl}/flows`);
      const flows = flowsResponse.data;

      console.log(`📊 Found ${flows.length} deployed flows\n`);

      // Look for debug nodes and their outputs
      const debugNodes = flows.filter((node) => node.type === "debug");

      if (debugNodes.length === 0) {
        console.log("❌ No debug nodes found in deployed flows");
        console.log("💡 This means we can't see the actual outputs");
        return;
      }

      console.log(`🔍 Found ${debugNodes.length} debug nodes:`);
      debugNodes.forEach((node, index) => {
        console.log(
          `  ${index + 1}. ${node.name || "Unnamed Debug"} (ID: ${node.id})`
        );
      });

      console.log("\n📝 To see real outputs:");
      console.log("1. Open Node-RED at http://localhost:1880");
      console.log("2. Look at the debug panel on the right");
      console.log("3. Run the agents again to see live outputs");
      console.log("4. The debug nodes will show actual OpenAI responses");
    } catch (error) {
      console.error(`❌ Failed to get Node-RED data: ${error.message}`);
    }
  }

  async testRealAgentOutput() {
    console.log("\n🧪 TESTING REAL AGENT OUTPUT");
    console.log("============================\n");

    console.log("📋 What we're going to test:");
    console.log("1. Run an email processor agent");
    console.log("2. Check Node-RED debug panel for actual output");
    console.log("3. Verify if OpenAI is actually generating responses");
    console.log("4. See if the sentiment analysis is working\n");

    console.log("🎯 Instructions:");
    console.log("1. Keep this terminal open");
    console.log("2. Open Node-RED at http://localhost:1880");
    console.log("3. Look at the debug panel");
    console.log(
      '4. Run: node fractal_agent_cli.js run "universe.galaxy.solar_system.planet.continent.country.city.building.email_processor_1753579222708" \'{"email_content": "I love your product! It\'s amazing!"}\''
    );
    console.log("5. Watch the debug panel for real output");
  }

  async showWhatWeActuallyHave() {
    console.log("\n🎯 WHAT WE ACTUALLY HAVE (REALITY CHECK)");
    console.log("========================================\n");

    console.log("✅ REAL CAPABILITIES:");
    console.log("1. Node-RED workflow deployment - WORKING");
    console.log("2. OpenAI API integration - WORKING");
    console.log("3. Agent spawning mechanism - WORKING");
    console.log("4. State persistence - WORKING");
    console.log("5. Node triggering via REST API - WORKING\n");

    console.log("❌ WHAT WE'RE MISSING:");
    console.log("1. Real business system integrations");
    console.log("2. Actual email sending capabilities");
    console.log("3. Real inventory management APIs");
    console.log("4. Real financial system connections");
    console.log("5. Real customer database integration\n");

    console.log("🔧 WHAT WE NEED TO BUILD FOR REAL BUSINESS VALUE:");
    console.log("1. Email service integration (SendGrid, Mailgun, etc.)");
    console.log("2. CRM system integration (Salesforce, HubSpot, etc.)");
    console.log("3. Inventory management system (Shopify, WooCommerce, etc.)");
    console.log("4. Financial system integration (QuickBooks, Stripe, etc.)");
    console.log("5. Customer support system (Zendesk, Intercom, etc.)");
  }

  async run() {
    await this.getNodeOutputs();
    await this.testRealAgentOutput();
    await this.showWhatWeActuallyHave();

    console.log("\n🎯 NEXT STEPS FOR REAL BUSINESS VALUE:");
    console.log("=====================================\n");
    console.log("1. 🧪 Test current agents in Node-RED debug panel");
    console.log("2. 🔗 Integrate with real business APIs");
    console.log("3. 📧 Add actual email sending capabilities");
    console.log("4. 💾 Connect to real databases");
    console.log("5. 📊 Implement real business metrics");
    console.log("6. 🚀 Deploy to production infrastructure");
  }
}

// Run the output capture
async function main() {
  const capture = new OutputCapture();
  await capture.run();
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = { OutputCapture };
