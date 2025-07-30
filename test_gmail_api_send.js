#!/usr/bin/env node

const fs = require("fs");
const { google } = require("googleapis");

async function testGmailApiSend() {
  console.log("🧪 Testing Gmail API email sending...");

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

    console.log("📤 Sending test email via Gmail API...");

    // Create email content
    const emailContent = `From: pragmagen@gmail.com
To: vandyand@gmail.com
Subject: Test Email - Gmail API Working
Content-Type: text/plain; charset=utf-8

This is a test email to verify Gmail API is working correctly.

Best regards,
PragmaGen Systems`;

    // Encode the email in base64
    const encodedEmail = Buffer.from(emailContent).toString("base64")
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=+$/, "");

    console.log("📧 Sending email...");

    // Send email via Gmail API
    const result = await gmail.users.messages.send({
      userId: "me",
      requestBody: {
        raw: encodedEmail
      }
    });

    console.log("✅ Email sent successfully via Gmail API!");
    console.log("📧 Message ID:", result.data.id);
    console.log("📧 Thread ID:", result.data.threadId);
    console.log("📧 Label IDs:", result.data.labelIds);

  } catch (error) {
    console.error("❌ Gmail API email send failed:");
    console.error("   Error message:", error.message);
    console.error("   Error code:", error.code);
    console.error("   Error stack:", error.stack);
    
    if (error.response) {
      console.error("   Response data:", error.response.data);
      console.error("   Response status:", error.response.status);
    }
  }
}

testGmailApiSend(); 