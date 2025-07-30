#!/usr/bin/env node

const fs = require("fs");
const { google } = require("googleapis");

async function testEmailQuery() {
  console.log("🔍 Testing email query...");

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

    // Test different queries
    const queries = [
      'is:unread',
      'is:unread -label:"Processed by Node-RED"',
      'is:unread -label:Label_1',
      'from:vandyand@gmail.com'
    ];

    for (const query of queries) {
      console.log(`\n🔍 Testing query: "${query}"`);
      
      const response = await gmail.users.messages.list({
        userId: "me",
        q: query,
        maxResults: 5,
      });

      const messages = response.data.messages || [];
      console.log(`📧 Found ${messages.length} emails`);

      if (messages.length > 0) {
        for (const message of messages) {
          // Get email details
          const emailResponse = await gmail.users.messages.get({
            userId: "me",
            id: message.id,
          });

          const headers = emailResponse.data.payload.headers;
          const from = headers.find(h => h.name === "From")?.value || "Unknown";
          const subject = headers.find(h => h.name === "Subject")?.value || "No Subject";
          const labels = emailResponse.data.labelIds || [];

          console.log(`   📨 ${message.id}: ${from} - "${subject}"`);
          console.log(`   🏷️ Labels: ${labels.join(", ")}`);
        }
      }
    }

  } catch (error) {
    console.error("❌ Failed to test email query:", error.message);
    console.error("Full error:", error);
  }
}

testEmailQuery(); 