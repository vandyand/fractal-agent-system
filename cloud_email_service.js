const express = require("express");
const { google } = require("googleapis");
const nodemailer = require("nodemailer");
const fs = require("fs");
const path = require("path");

/**
 * Cloud-based Email Service for 24/7 email responsiveness
 * This service can be deployed to cloud platforms (Heroku, Railway, AWS Lambda)
 * to provide persistent email listening and processing.
 */

class CloudEmailService {
  constructor() {
    this.app = express();
    this.port = process.env.PORT || 3000;
    this.gmail = null;
    this.oAuth2Client = null;
    this.emailQueue = [];
    this.isProcessing = false;

    this.setupExpress();
    this.setupGmailAPI();
  }

  setupExpress() {
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: true }));

    // Health check endpoint
    this.app.get("/health", (req, res) => {
      res.json({
        status: "healthy",
        timestamp: new Date().toISOString(),
        queueLength: this.emailQueue.length,
        isProcessing: this.isProcessing,
      });
    });

    // Manual trigger endpoint
    this.app.post("/trigger-email-check", async (req, res) => {
      try {
        await this.checkForNewEmails();
        res.json({ success: true, message: "Email check triggered" });
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    });

    // Webhook endpoint for external triggers
    this.app.post("/webhook/email", async (req, res) => {
      try {
        const { action, data } = req.body;

        switch (action) {
          case "send_email":
            await this.sendEmail(data);
            break;
          case "process_emails":
            await this.checkForNewEmails();
            break;
          default:
            throw new Error(`Unknown action: ${action}`);
        }

        res.json({ success: true });
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    });

    // Email processing status
    this.app.get("/status/emails", (req, res) => {
      res.json({
        queueLength: this.emailQueue.length,
        isProcessing: this.isProcessing,
        lastCheck: this.lastCheckTime,
        processedToday: this.processedToday,
      });
    });
  }

  async setupGmailAPI() {
    try {
      // Load credentials from environment variables (for cloud deployment)
      const credentials = {
        client_id: process.env.GMAIL_CLIENT_ID,
        client_secret: process.env.GMAIL_CLIENT_SECRET,
        redirect_uri: process.env.GMAIL_REDIRECT_URI || "http://localhost:3000",
      };

      this.oAuth2Client = new google.auth.OAuth2(
        credentials.client_id,
        credentials.client_secret,
        credentials.redirect_uri
      );

      // Load token from environment variable
      if (process.env.GMAIL_TOKEN) {
        const token = JSON.parse(process.env.GMAIL_TOKEN);
        this.oAuth2Client.setCredentials(token);
      }

      this.gmail = google.gmail({ version: "v1", auth: this.oAuth2Client });
      console.log("✅ Gmail API initialized");
    } catch (error) {
      console.error("❌ Failed to setup Gmail API:", error.message);
    }
  }

  async checkForNewEmails() {
    if (this.isProcessing) {
      console.log("⚠️ Email processing already in progress");
      return;
    }

    this.isProcessing = true;
    this.lastCheckTime = new Date().toISOString();

    try {
      console.log("📥 Checking for new emails...");

      const response = await this.gmail.users.messages.list({
        userId: "me",
        q: 'is:unread -label:"Processed by Node-RED"',
        maxResults: 10,
      });

      const messages = response.data.messages || [];

      if (messages.length === 0) {
        console.log("📭 No new emails found");
        return;
      }

      console.log(`📧 Found ${messages.length} new emails`);

      // Process emails in parallel
      const emailPromises = messages.map((msg) => this.processEmail(msg.id));
      await Promise.all(emailPromises);

      this.processedToday = (this.processedToday || 0) + messages.length;
      console.log(`✅ Processed ${messages.length} emails`);
    } catch (error) {
      console.error("❌ Error checking emails:", error.message);
    } finally {
      this.isProcessing = false;
    }
  }

  async processEmail(messageId) {
    try {
      // Get email details
      const response = await this.gmail.users.messages.get({
        userId: "me",
        id: messageId,
      });

      const email = this.parseEmailMessage(response.data);

      // Add to processing queue
      this.emailQueue.push({
        id: messageId,
        email: email,
        receivedAt: new Date().toISOString(),
        status: "queued",
      });

      // Route email to appropriate agent
      await this.routeEmailToAgent(email, messageId);

      // Mark as processed
      await this.markEmailAsProcessed(messageId);
    } catch (error) {
      console.error(`❌ Error processing email ${messageId}:`, error.message);
    }
  }

  parseEmailMessage(message) {
    const headers = message.payload.headers;
    const body = this.getEmailBody(message.payload);

    return {
      id: message.id,
      from: this.getHeader(headers, "From"),
      to: this.getHeader(headers, "To"),
      subject: this.getHeader(headers, "Subject"),
      date: this.getHeader(headers, "Date"),
      body: body,
      snippet: message.snippet,
    };
  }

  getEmailBody(payload) {
    if (payload.body && payload.body.data) {
      return Buffer.from(payload.body.data, "base64").toString("utf-8");
    }

    if (payload.parts) {
      for (const part of payload.parts) {
        if (part.mimeType === "text/plain" && part.body && part.body.data) {
          return Buffer.from(part.body.data, "base64").toString("utf-8");
        }
      }
    }

    return "";
  }

  getHeader(headers, name) {
    const header = headers.find((h) => h.name === name);
    return header ? header.value : "";
  }

  async routeEmailToAgent(email, messageId) {
    const category = this.categorizeEmail(email);
    const priority = this.detectPriority(email);

    console.log(
      `📧 Routing email: ${email.subject} (${category}, ${priority})`
    );

    // Route to appropriate agent based on category
    switch (category) {
      case "support":
        await this.sendToSupportAgent(email, messageId);
        break;
      case "sales":
        await this.sendToSalesAgent(email, messageId);
        break;
      case "technical":
        await this.sendToTechnicalAgent(email, messageId);
        break;
      case "urgent":
        await this.sendToEscalationAgent(email, messageId);
        break;
      default:
        await this.sendToGeneralAgent(email, messageId);
    }
  }

  categorizeEmail(email) {
    const subject = email.subject.toLowerCase();
    const body = email.body.toLowerCase();
    const from = email.from.toLowerCase();

    // Support emails
    if (
      subject.includes("support") ||
      subject.includes("help") ||
      subject.includes("issue") ||
      subject.includes("problem")
    ) {
      return "support";
    }

    // Sales emails
    if (
      subject.includes("quote") ||
      subject.includes("pricing") ||
      subject.includes("demo") ||
      subject.includes("sales")
    ) {
      return "sales";
    }

    // Technical emails
    if (
      subject.includes("technical") ||
      subject.includes("bug") ||
      subject.includes("error") ||
      subject.includes("api")
    ) {
      return "technical";
    }

    // Urgent emails
    if (
      subject.includes("urgent") ||
      subject.includes("emergency") ||
      subject.includes("critical") ||
      subject.includes("asap")
    ) {
      return "urgent";
    }

    return "general";
  }

  detectPriority(email) {
    const subject = email.subject.toLowerCase();
    const body = email.body.toLowerCase();

    if (
      subject.includes("urgent") ||
      subject.includes("emergency") ||
      subject.includes("critical") ||
      subject.includes("asap")
    ) {
      return "high";
    }

    if (subject.includes("important") || subject.includes("priority")) {
      return "medium";
    }

    return "low";
  }

  async sendToSupportAgent(email, messageId) {
    // Send to Node-RED webhook for support agent processing
    await this.sendToNodeRedWebhook("support_agent", email, messageId);
  }

  async sendToSalesAgent(email, messageId) {
    await this.sendToNodeRedWebhook("sales_agent", email, messageId);
  }

  async sendToTechnicalAgent(email, messageId) {
    await this.sendToNodeRedWebhook("technical_agent", email, messageId);
  }

  async sendToEscalationAgent(email, messageId) {
    await this.sendToNodeRedWebhook("escalation_agent", email, messageId);
  }

  async sendToGeneralAgent(email, messageId) {
    await this.sendToNodeRedWebhook("general_agent", email, messageId);
  }

  async sendToNodeRedWebhook(agentType, email, messageId) {
    try {
      const webhookUrl =
        process.env.NODE_RED_WEBHOOK_URL || "http://localhost:1880/webhook";

      const response = await fetch(`${webhookUrl}/${agentType}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          agentType: agentType,
          email: email,
          messageId: messageId,
          timestamp: new Date().toISOString(),
        }),
      });

      if (!response.ok) {
        throw new Error(`Webhook failed: ${response.status}`);
      }

      console.log(`✅ Routed to ${agentType}`);
    } catch (error) {
      console.error(`❌ Failed to send to ${agentType}:`, error.message);
    }
  }

  async markEmailAsProcessed(messageId) {
    try {
      // Add "Processed by Node-RED" label
      await this.gmail.users.messages.modify({
        userId: "me",
        id: messageId,
        requestBody: {
          addLabelIds: ["Label_1"], // Processed by Node-RED label
        },
      });

      console.log(`✅ Marked email ${messageId} as processed`);
    } catch (error) {
      console.error(`❌ Failed to mark email as processed:`, error.message);
    }
  }

  async sendEmail(emailData) {
    try {
      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          type: "OAuth2",
          user: process.env.GMAIL_USER,
          clientId: process.env.GMAIL_CLIENT_ID,
          clientSecret: process.env.GMAIL_CLIENT_SECRET,
          refreshToken: process.env.GMAIL_REFRESH_TOKEN,
          accessToken: process.env.GMAIL_ACCESS_TOKEN,
        },
      });

      const mailOptions = {
        from: process.env.GMAIL_USER,
        to: emailData.to,
        subject: emailData.subject,
        text: emailData.text,
        html: emailData.html,
      };

      const result = await transporter.sendMail(mailOptions);
      console.log(`✅ Email sent: ${result.messageId}`);
      return result;
    } catch (error) {
      console.error("❌ Failed to send email:", error.message);
      throw error;
    }
  }

  startPolling(intervalMinutes = 5) {
    console.log(`🔄 Starting email polling every ${intervalMinutes} minutes`);

    // Initial check
    this.checkForNewEmails();

    // Set up periodic polling
    setInterval(() => {
      this.checkForNewEmails();
    }, intervalMinutes * 60 * 1000);
  }

  start() {
    this.app.listen(this.port, () => {
      console.log(`🚀 Cloud Email Service running on port ${this.port}`);
      console.log(`📧 Health check: http://localhost:${this.port}/health`);
      console.log(
        `🔗 Webhook endpoint: http://localhost:${this.port}/webhook/email`
      );

      // Start email polling
      this.startPolling();
    });
  }
}

// Start the service if run directly
if (require.main === module) {
  const service = new CloudEmailService();
  service.start();
}

module.exports = CloudEmailService;
