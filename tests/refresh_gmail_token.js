#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const { google } = require("googleapis");

async function refreshToken() {
  console.log("🔄 Refreshing Gmail OAuth2 token...");

  try {
    // Load credentials
    const credentials = JSON.parse(
      fs.readFileSync(path.join(__dirname, "../email_data/credentials.json"), "utf8")
    );
    const { client_secret, client_id, redirect_uris } =
      credentials.installed || credentials.web || credentials;

    // Create OAuth2 client
    const oAuth2Client = new google.auth.OAuth2(
      client_id,
      client_secret,
      redirect_uris[0]
    );

    // Load current token
    const token = JSON.parse(
      fs.readFileSync(path.join(__dirname, "../email_data/token.json"), "utf8")
    );

    console.log("📧 Current token expiry:", new Date(token.expiry_date));
    console.log("🕐 Current time:", new Date());

    // Set credentials
    oAuth2Client.setCredentials(token);

    // Refresh the token
    console.log("🔄 Refreshing token...");
    const { credentials: newCredentials } = await oAuth2Client.refreshAccessToken();

    // Save the new token
    const newToken = {
      ...token,
      access_token: newCredentials.access_token || token.access_token,
      expiry_date: newCredentials.expiry_date || Date.now() + 3600000
    };

    fs.writeFileSync(path.join(__dirname, "../email_data/token.json"), JSON.stringify(newToken, null, 2));

    console.log("✅ Token refreshed successfully!");
    console.log("📧 New token expiry:", new Date(newToken.expiry_date));
    console.log("🕐 Current time:", new Date());

  } catch (error) {
    console.error("❌ Failed to refresh token:", error.message);
    console.error("Full error:", error);
    
    // The refresh token is invalid, we need to get a new one
    if (error.message.includes("invalid_grant")) {
      console.error("\n💡 The refresh token is invalid or has been revoked. You need to re-authenticate.");
      console.error("💡 Run the following command to set up Gmail authentication:");
      console.error("   node tests/gmail_setup.js\n");
    }
    
    process.exit(1);
  }
}

refreshToken(); 
