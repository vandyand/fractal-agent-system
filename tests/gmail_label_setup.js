const { google } = require("googleapis");
const fs = require("fs");
const path = require("path");

/**
 * Setup script to create Gmail labels for Node-RED email processing
 * This script creates a custom label "Processed by Node-RED" that will be used
 * to mark emails that have been processed by our Node-RED flows.
 */

class GmailLabelSetup {
  constructor() {
    this.credentialsFile = path.join(
      __dirname,
      "email_data",
      "credentials.json"
    );
    this.tokenFile = path.join(__dirname, "email_data", "token.json");
    this.labelName = "Processed by Node-RED";
    this.emailAccount = "pragmagen@gmail.com";
    this.oAuth2Client = null;
    this.gmail = null;
  }

  async init() {
    console.log("🔧 Setting up Gmail labels for Node-RED...");

    try {
      // Load credentials
      const credentials = JSON.parse(
        fs.readFileSync(this.credentialsFile, "utf8")
      );
      const { client_secret, client_id, redirect_uris } =
        credentials.installed || credentials.web || credentials;

      this.oAuth2Client = new google.auth.OAuth2(
        client_id,
        client_secret,
        redirect_uris[0]
      );

      // Load token
      if (fs.existsSync(this.tokenFile)) {
        const token = JSON.parse(fs.readFileSync(this.tokenFile, "utf8"));
        this.oAuth2Client.setCredentials(token);
        console.log("✅ Gmail API token loaded");
      } else {
        throw new Error(
          "Gmail API token not found. Please run the enhanced email system first to authenticate."
        );
      }

      this.gmail = google.gmail({ version: "v1", auth: this.oAuth2Client });
    } catch (error) {
      console.error("❌ Failed to initialize Gmail API:", error.message);
      throw error;
    }
  }

  async createLabel() {
    console.log(`🏷️ Creating Gmail label: "${this.labelName}"`);

    try {
      // Check if label already exists
      const existingLabels = await this.gmail.users.labels.list({
        userId: "me",
      });
      const labelExists = existingLabels.data.labels.find(
        (label) => label.name === this.labelName
      );

      if (labelExists) {
        console.log(`✅ Label "${this.labelName}" already exists`);
        return labelExists.id;
      }

      // Create new label
      const label = await this.gmail.users.labels.create({
        userId: "me",
        requestBody: {
          name: this.labelName,
          labelListVisibility: "labelShow",
          messageListVisibility: "show",
        },
      });

      console.log(`✅ Label "${this.labelName}" created successfully`);
      console.log(`   Label ID: ${label.data.id}`);

      return label.data.id;
    } catch (error) {
      console.error("❌ Failed to create label:", error.message);
      throw error;
    }
  }

  async listLabels() {
    console.log("📋 Listing all Gmail labels:");

    try {
      const response = await this.gmail.users.labels.list({ userId: "me" });
      const labels = response.data.labels;

      labels.forEach((label) => {
        console.log(`   - ${label.name} (ID: ${label.id})`);
      });

      return labels;
    } catch (error) {
      console.error("❌ Failed to list labels:", error.message);
      throw error;
    }
  }

  async applyLabelToEmail(messageId, labelId) {
    console.log(`🏷️ Applying label to email: ${messageId}`);

    try {
      await this.gmail.users.messages.modify({
        userId: "me",
        id: messageId,
        requestBody: {
          addLabelIds: [labelId],
        },
      });

      console.log(`✅ Label applied to email: ${messageId}`);
    } catch (error) {
      console.error("❌ Failed to apply label:", error.message);
      throw error;
    }
  }

  async testLabeling() {
    console.log("🧪 Testing label application...");

    try {
      // Get the label ID
      const labelId = await this.createLabel();

      // Get a recent unread email for testing
      const messages = await this.gmail.users.messages.list({
        userId: "me",
        q: "is:unread",
        maxResults: 1,
      });

      if (messages.data.messages && messages.data.messages.length > 0) {
        const testMessageId = messages.data.messages[0].id;
        await this.applyLabelToEmail(testMessageId, labelId);
        console.log("✅ Label test completed successfully");
      } else {
        console.log("⚠️ No unread emails found for testing");
      }
    } catch (error) {
      console.error("❌ Label test failed:", error.message);
      throw error;
    }
  }
}

async function main() {
  const setup = new GmailLabelSetup();

  try {
    await setup.init();

    // Create the label
    await setup.createLabel();

    // List all labels
    await setup.listLabels();

    // Test labeling (optional)
    console.log("\n🧪 Would you like to test label application? (y/n)");
    // For now, we'll skip the test to avoid modifying emails
    console.log("⚠️ Skipping test to avoid modifying emails");

    console.log("\n✅ Gmail label setup completed!");
    console.log('📧 Node-RED can now use the "Processed by Node-RED" label');
  } catch (error) {
    console.error("❌ Setup failed:", error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = GmailLabelSetup;
