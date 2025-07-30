#!/usr/bin/env node

const fs = require("fs");
const { google } = require("googleapis");

async function refreshToken() {
  console.log("🔄 Refreshing Gmail OAuth2 token...");

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

    // Load current token
    const token = JSON.parse(
      fs.readFileSync("email_data/token.json", "utf8")
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
      access_token: newCredentials.access_token,
      expiry_date: newCredentials.expiry_date
    };

    fs.writeFileSync("email_data/token.json", JSON.stringify(newToken, null, 2));

    console.log("✅ Token refreshed successfully!");
    console.log("📧 New token expiry:", new Date(newToken.expiry_date));
    console.log("🕐 Current time:", new Date());

  } catch (error) {
    console.error("❌ Failed to refresh token:", error.message);
    console.error("Full error:", error);
    process.exit(1);
  }
}

refreshToken(); 