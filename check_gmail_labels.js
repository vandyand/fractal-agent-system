#!/usr/bin/env node

const fs = require("fs");
const { google } = require("googleapis");

async function checkLabels() {
  console.log("🏷️ Checking Gmail labels...");

  try {
    // Load credentials
    const credentials = JSON.parse(
      fs.readFileSync("email_data/credentials.json", "utf8")
    );
    const { client_secret, client_id, redirect_uris } =
      credentials.installed || credentials.web || credentials;

    // Create OAuth2 client
    const oAuth2Client = new google.auth.OAuth2(
      client_id,
      client_secret,
      redirect_uris[0]
    );

    // Load token
    const token = JSON.parse(
      fs.readFileSync("email_data/token.json", "utf8")
    );
    oAuth2Client.setCredentials(token);

    // Create Gmail API client
    const gmail = google.gmail({ version: "v1", auth: oAuth2Client });

    console.log("📧 Fetching labels...");

    // Get all labels
    const response = await gmail.users.labels.list({
      userId: "me"
    });

    const labels = response.data.labels || [];

    console.log(`📋 Found ${labels.length} labels:`);
    console.log("");

    // Look for the "Processed by Node-RED" label
    let processedLabel = null;

    for (const label of labels) {
      console.log(`🏷️ ${label.name} (ID: ${label.id})`);
      
      if (label.name === "Processed by Node-RED") {
        processedLabel = label;
      }
    }

    console.log("");
    if (processedLabel) {
      console.log("✅ Found 'Processed by Node-RED' label:");
      console.log(`   ID: ${processedLabel.id}`);
      console.log(`   Name: ${processedLabel.name}`);
      console.log(`   Type: ${processedLabel.type}`);
    } else {
      console.log("❌ 'Processed by Node-RED' label not found!");
      console.log("💡 You may need to create this label first.");
    }

  } catch (error) {
    console.error("❌ Failed to check labels:", error.message);
    console.error("Full error:", error);
  }
}

checkLabels(); 