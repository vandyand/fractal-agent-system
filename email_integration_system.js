#!/usr/bin/env node

const nodemailer = require("nodemailer");
const { google } = require("googleapis");
const fs = require("fs");
const path = require("path");
const EventEmitter = require("events");

class EmailIntegrationSystem extends EventEmitter {
  constructor() {
    super();
    this.transporter = null;
    this.gmail = null;
    this.isAuthenticated = false;
    this.dataDir = "./email_data";
    this.configFile = path.join(this.dataDir, "email_config.json");
    this.credentialsFile = path.join(this.dataDir, "credentials.json");
    this.tokenFile = path.join(this.dataDir, "token.json");

    // Initialize data directory
    if (!fs.existsSync(this.dataDir)) {
      fs.mkdirSync(this.dataDir, { recursive: true });
    }

    // Email templates
    this.emailTemplates = {
      customer_support: {
        subject: "Customer Support Response - {ticketId}",
        body: `
Dear {customerName},

Thank you for contacting our support team regarding: {inquiry}

{response}

If you have any further questions, please don't hesitate to reach out.

Best regards,
{agentName}
Support Team
        `,
        variables: [
          "customerName",
          "ticketId",
          "inquiry",
          "response",
          "agentName",
        ],
      },
      order_confirmation: {
        subject: "Order Confirmation - {orderId}",
        body: `
Dear {customerName},

Thank you for your order! Here are your order details:

Order ID: {orderId}
Order Date: {orderDate}
Total Amount: {totalAmount}

{orderItems}

Your order will be processed and shipped within 2-3 business days.

Best regards,
{companyName}
        `,
        variables: [
          "customerName",
          "orderId",
          "orderDate",
          "totalAmount",
          "orderItems",
          "companyName",
        ],
      },
      newsletter: {
        subject: "Weekly Newsletter - {date}",
        body: `
Hello {subscriberName},

Here's your weekly newsletter with the latest updates:

{content}

Stay tuned for more updates!

Best regards,
{companyName}
        `,
        variables: ["subscriberName", "date", "content", "companyName"],
      },
    };

    // Email processing rules
    this.processingRules = {
      auto_reply: {
        enabled: true,
        keywords: ["urgent", "help", "support", "issue"],
        response_template: "auto_reply",
      },
      categorization: {
        enabled: true,
        categories: {
          support: ["help", "support", "issue", "problem", "broken"],
          sales: ["purchase", "buy", "order", "price", "cost"],
          general: ["info", "question", "inquiry", "contact"],
        },
      },
      priority_detection: {
        enabled: true,
        high_priority: ["urgent", "critical", "emergency", "asap"],
        medium_priority: ["important", "needed", "required"],
        low_priority: ["general", "info", "question"],
      },
    };
  }

  async init() {
    console.log("📧 EMAIL INTEGRATION SYSTEM");
    console.log("===========================\n");

    try {
      // Load configuration
      await this.loadConfiguration();

      // Setup Gmail authentication
      await this.setupGmailAuth();

      // Test email connectivity
      await this.testEmailConnectivity();

      console.log("✅ Email integration system initialized");
    } catch (error) {
      console.error(
        "❌ Email integration initialization failed:",
        error.message
      );
      throw error;
    }
  }

  async loadConfiguration() {
    console.log("📂 Loading email configuration...");

    if (fs.existsSync(this.configFile)) {
      const config = JSON.parse(fs.readFileSync(this.configFile, "utf8"));
      this.config = config;
      console.log("✅ Email configuration loaded");
    } else {
      console.log("⚠️ No email configuration found. Please run setup first.");
      this.config = null;
    }
  }

  async setupGmailAuth() {
    console.log("🔐 Setting up Gmail authentication...");

    if (!fs.existsSync(this.credentialsFile)) {
      throw new Error(
        "Gmail credentials file not found. Please add credentials.json to email_data/"
      );
    }

    const credentials = JSON.parse(
      fs.readFileSync(this.credentialsFile, "utf8")
    );

    const { client_secret, client_id, redirect_uris } = credentials.installed;
    this.oAuth2Client = new google.auth.OAuth2(
      client_id,
      client_secret,
      redirect_uris[0]
    );

    // Load existing token or get new one
    if (fs.existsSync(this.tokenFile)) {
      const token = JSON.parse(fs.readFileSync(this.tokenFile, "utf8"));
      this.oAuth2Client.setCredentials(token);
      console.log("✅ Gmail token loaded from file");
    } else {
      await this.getNewToken();
    }

    // Setup Gmail API
    this.gmail = google.gmail({ version: "v1", auth: this.oAuth2Client });

    // Setup nodemailer transporter
    this.transporter = nodemailer.createTransporter({
      service: "gmail",
      auth: {
        type: "OAuth2",
        user: this.config?.email || "your-email@gmail.com",
        clientId: client_id,
        clientSecret: client_secret,
        refreshToken: this.oAuth2Client.credentials.refresh_token,
        accessToken: this.oAuth2Client.credentials.access_token,
      },
    });

    this.isAuthenticated = true;
    console.log("✅ Gmail authentication setup complete");
  }

  async getNewToken() {
    console.log("🔑 Getting new Gmail token...");

    const authUrl = this.oAuth2Client.generateAuthUrl({
      access_type: "offline",
      scope: [
        "https://mail.google.com/",
        "https://www.googleapis.com/auth/gmail.send",
        "https://www.googleapis.com/auth/gmail.readonly",
      ],
    });

    console.log("🔗 Please visit this URL to authorize the application:");
    console.log(authUrl);
    console.log(
      "\n📋 After authorization, please provide the authorization code:"
    );

    // In a real implementation, you'd handle this interactively
    // For now, we'll create a placeholder token
    const token = {
      access_token: "placeholder_access_token",
      refresh_token: "placeholder_refresh_token",
      scope:
        "https://mail.google.com/ https://www.googleapis.com/auth/gmail.send https://www.googleapis.com/auth/gmail.readonly",
      token_type: "Bearer",
      expiry_date: Date.now() + 3600000,
    };

    fs.writeFileSync(this.tokenFile, JSON.stringify(token, null, 2));
    this.oAuth2Client.setCredentials(token);

    console.log("✅ New token saved");
  }

  async testEmailConnectivity() {
    console.log("🧪 Testing email connectivity...");

    try {
      // Test Gmail API connection
      const profile = await this.gmail.users.getProfile({ userId: "me" });
      console.log(`✅ Gmail API connected: ${profile.data.emailAddress}`);

      // Test nodemailer connection
      await this.transporter.verify();
      console.log("✅ Nodemailer transporter verified");

      return true;
    } catch (error) {
      console.error("❌ Email connectivity test failed:", error.message);
      throw error;
    }
  }

  // Send email
  async sendEmail(to, subject, body, options = {}) {
    if (!this.isAuthenticated) {
      throw new Error("Email system not authenticated");
    }

    console.log(`📧 Sending email to: ${to}`);
    console.log(`📝 Subject: ${subject}`);

    const mailOptions = {
      from: this.config?.email || "your-email@gmail.com",
      to: to,
      subject: subject,
      html: body,
      ...options,
    };

    try {
      const result = await this.transporter.sendMail(mailOptions);
      console.log(`✅ Email sent successfully: ${result.messageId}`);

      // Save email record
      this.saveEmailRecord({
        type: "sent",
        to: to,
        subject: subject,
        messageId: result.messageId,
        timestamp: new Date().toISOString(),
      });

      return {
        success: true,
        messageId: result.messageId,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      console.error(`❌ Email sending failed: ${error.message}`);
      throw error;
    }
  }

  // Send email using template
  async sendTemplatedEmail(to, templateName, variables, options = {}) {
    const template = this.emailTemplates[templateName];
    if (!template) {
      throw new Error(`Email template not found: ${templateName}`);
    }

    // Replace variables in template
    let subject = template.subject;
    let body = template.body;

    Object.entries(variables).forEach(([key, value]) => {
      const regex = new RegExp(`{${key}}`, "g");
      subject = subject.replace(regex, value);
      body = body.replace(regex, value);
    });

    return await this.sendEmail(to, subject, body, options);
  }

  // Receive emails
  async receiveEmails(maxResults = 10) {
    if (!this.isAuthenticated) {
      throw new Error("Email system not authenticated");
    }

    console.log(`📥 Receiving emails (max: ${maxResults})...`);

    try {
      const response = await this.gmail.users.messages.list({
        userId: "me",
        maxResults: maxResults,
        labelIds: ["INBOX"],
      });

      const messages = response.data.messages || [];
      const emails = [];

      for (const message of messages) {
        const email = await this.getEmailDetails(message.id);
        emails.push(email);
      }

      console.log(`✅ Received ${emails.length} emails`);
      return emails;
    } catch (error) {
      console.error(`❌ Email receiving failed: ${error.message}`);
      throw error;
    }
  }

  // Get detailed email information
  async getEmailDetails(messageId) {
    try {
      const response = await this.gmail.users.messages.get({
        userId: "me",
        id: messageId,
      });

      const message = response.data;
      const headers = message.payload.headers;

      const email = {
        id: messageId,
        threadId: message.threadId,
        subject: this.getHeader(headers, "Subject") || "No Subject",
        from: this.getHeader(headers, "From") || "Unknown",
        to: this.getHeader(headers, "To") || "",
        date: this.getHeader(headers, "Date") || "",
        snippet: message.snippet || "",
        body: this.getEmailBody(message.payload),
        labels: message.labelIds || [],
        sizeEstimate: message.sizeEstimate || 0,
      };

      // Process email for categorization and priority
      email.category = this.categorizeEmail(email);
      email.priority = this.detectPriority(email);
      email.autoReplyNeeded = this.needsAutoReply(email);

      return email;
    } catch (error) {
      console.error(
        `❌ Failed to get email details for ${messageId}: ${error.message}`
      );
      return null;
    }
  }

  // Extract email body
  getEmailBody(payload) {
    if (payload.body && payload.body.data) {
      return Buffer.from(payload.body.data, "base64").toString("utf-8");
    }

    if (payload.parts) {
      for (const part of payload.parts) {
        if (part.mimeType === "text/plain" && part.body && part.body.data) {
          return Buffer.from(part.body.data, "base64").toString("utf-8");
        }
        if (part.mimeType === "text/html" && part.body && part.body.data) {
          return Buffer.from(part.body.data, "base64").toString("utf-8");
        }
      }
    }

    return "";
  }

  // Get header value
  getHeader(headers, name) {
    const header = headers.find((h) => h.name === name);
    return header ? header.value : null;
  }

  // Categorize email
  categorizeEmail(email) {
    if (!this.processingRules.categorization.enabled) {
      return "general";
    }

    const content =
      `${email.subject} ${email.snippet} ${email.body}`.toLowerCase();

    for (const [category, keywords] of Object.entries(
      this.processingRules.categorization.categories
    )) {
      if (keywords.some((keyword) => content.includes(keyword))) {
        return category;
      }
    }

    return "general";
  }

  // Detect email priority
  detectPriority(email) {
    if (!this.processingRules.priority_detection.enabled) {
      return "medium";
    }

    const content =
      `${email.subject} ${email.snippet} ${email.body}`.toLowerCase();

    if (
      this.processingRules.priority_detection.high_priority.some((keyword) =>
        content.includes(keyword)
      )
    ) {
      return "high";
    }

    if (
      this.processingRules.priority_detection.medium_priority.some((keyword) =>
        content.includes(keyword)
      )
    ) {
      return "medium";
    }

    return "low";
  }

  // Check if email needs auto-reply
  needsAutoReply(email) {
    if (!this.processingRules.auto_reply.enabled) {
      return false;
    }

    const content =
      `${email.subject} ${email.snippet} ${email.body}`.toLowerCase();
    return this.processingRules.auto_reply.keywords.some((keyword) =>
      content.includes(keyword)
    );
  }

  // Send auto-reply
  async sendAutoReply(email) {
    if (!email.autoReplyNeeded) {
      return null;
    }

    const autoReplySubject = `Re: ${email.subject}`;
    const autoReplyBody = `
Dear ${email.from.split("@")[0]},

Thank you for your email. We have received your message and will respond within 24 hours.

Your inquiry: ${email.snippet}

Best regards,
Support Team
    `;

    return await this.sendEmail(email.from, autoReplySubject, autoReplyBody);
  }

  // Process incoming emails
  async processIncomingEmails() {
    console.log("🔄 Processing incoming emails...");

    const emails = await this.receiveEmails(5);
    const processedEmails = [];

    for (const email of emails) {
      if (!email) continue;

      console.log(
        `📧 Processing email: ${email.subject} (${email.category}, ${email.priority})`
      );

      // Send auto-reply if needed
      if (email.autoReplyNeeded) {
        await this.sendAutoReply(email);
        console.log(`✅ Auto-reply sent for: ${email.subject}`);
      }

      // Save email record
      this.saveEmailRecord({
        type: "received",
        from: email.from,
        subject: email.subject,
        category: email.category,
        priority: email.priority,
        messageId: email.id,
        timestamp: new Date().toISOString(),
      });

      processedEmails.push(email);
    }

    console.log(`✅ Processed ${processedEmails.length} emails`);
    return processedEmails;
  }

  // Save email record
  saveEmailRecord(record) {
    const recordsFile = path.join(this.dataDir, "email_records.json");

    let records = [];
    if (fs.existsSync(recordsFile)) {
      records = JSON.parse(fs.readFileSync(recordsFile, "utf8"));
    }

    records.push(record);
    fs.writeFileSync(recordsFile, JSON.stringify(records, null, 2));
  }

  // Get email statistics
  getEmailStats() {
    const recordsFile = path.join(this.dataDir, "email_records.json");

    if (!fs.existsSync(recordsFile)) {
      return {
        total: 0,
        sent: 0,
        received: 0,
        byCategory: {},
        byPriority: {},
      };
    }

    const records = JSON.parse(fs.readFileSync(recordsFile, "utf8"));

    const stats = {
      total: records.length,
      sent: records.filter((r) => r.type === "sent").length,
      received: records.filter((r) => r.type === "received").length,
      byCategory: {},
      byPriority: {},
    };

    records.forEach((record) => {
      if (record.category) {
        stats.byCategory[record.category] =
          (stats.byCategory[record.category] || 0) + 1;
      }
      if (record.priority) {
        stats.byPriority[record.priority] =
          (stats.byPriority[record.priority] || 0) + 1;
      }
    });

    return stats;
  }

  // Run email integration demo
  async runEmailDemo() {
    console.log("\n🎬 EMAIL INTEGRATION DEMO");
    console.log("=========================\n");

    // Test 1: Send a simple email
    console.log("📧 Test 1: Sending simple email");
    console.log("--------------------------------");

    try {
      const result = await this.sendEmail(
        this.config?.testEmail || "test@example.com",
        "Test Email from Fractal Agent System",
        `
        <h2>Hello from the Fractal Agent System!</h2>
        <p>This is a test email sent by our AI-powered email integration system.</p>
        <p><strong>Features tested:</strong></p>
        <ul>
          <li>Gmail OAuth2 authentication</li>
          <li>Email sending via nodemailer</li>
          <li>HTML email formatting</li>
          <li>Email record tracking</li>
        </ul>
        <p>Timestamp: ${new Date().toISOString()}</p>
        `,
        { html: true }
      );
      console.log(`✅ Test email sent: ${result.messageId}`);
    } catch (error) {
      console.log(`❌ Test email failed: ${error.message}`);
    }

    // Test 2: Send templated email
    console.log("\n📧 Test 2: Sending templated email");
    console.log("-----------------------------------");

    try {
      const result = await this.sendTemplatedEmail(
        this.config?.testEmail || "test@example.com",
        "customer_support",
        {
          customerName: "John Doe",
          ticketId: "TICKET-12345",
          inquiry: "Product not working properly",
          response:
            "We have identified the issue and are working on a fix. You should receive an update within 24 hours.",
          agentName: "AI Support Agent",
        }
      );
      console.log(`✅ Templated email sent: ${result.messageId}`);
    } catch (error) {
      console.log(`❌ Templated email failed: ${error.message}`);
    }

    // Test 3: Receive and process emails
    console.log("\n📥 Test 3: Receiving and processing emails");
    console.log("-------------------------------------------");

    try {
      const emails = await this.processIncomingEmails();
      console.log(`✅ Processed ${emails.length} emails`);

      emails.forEach((email) => {
        console.log(
          `   📧 ${email.subject} (${email.category}, ${email.priority})`
        );
      });
    } catch (error) {
      console.log(`❌ Email processing failed: ${error.message}`);
    }

    // Show email statistics
    console.log("\n📊 Email Statistics:");
    console.log("====================");
    const stats = this.getEmailStats();
    console.log(`📧 Total Emails: ${stats.total}`);
    console.log(`📤 Sent: ${stats.sent}`);
    console.log(`📥 Received: ${stats.received}`);

    if (Object.keys(stats.byCategory).length > 0) {
      console.log("\n📂 By Category:");
      Object.entries(stats.byCategory).forEach(([category, count]) => {
        console.log(`   ${category}: ${count}`);
      });
    }

    if (Object.keys(stats.byPriority).length > 0) {
      console.log("\n🎯 By Priority:");
      Object.entries(stats.byPriority).forEach(([priority, count]) => {
        console.log(`   ${priority}: ${count}`);
      });
    }

    console.log("\n✅ Email integration demo completed!");
  }
}

// Run email integration system
async function main() {
  const emailSystem = new EmailIntegrationSystem();
  await emailSystem.init();
  await emailSystem.runEmailDemo();
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = { EmailIntegrationSystem };
