#!/usr/bin/env node

const nodemailer = require("nodemailer");
const { google } = require("googleapis");
const fs = require("fs");
const path = require("path");
const readline = require("readline");

class EnhancedEmailSystem {
  constructor() {
    this.transporter = null;
    this.gmail = null;
    this.isAuthenticated = false;
    this.dataDir = "./email_data";
    this.configFile = path.join(this.dataDir, "enhanced_email_config.json");
    this.credentialsFile = path.join(this.dataDir, "credentials.json");
    this.tokenFile = path.join(this.dataDir, "token.json");
    this.recordsFile = path.join(this.dataDir, "email_records.json");

    // Initialize data directory
    if (!fs.existsSync(this.dataDir)) {
      fs.mkdirSync(this.dataDir, { recursive: true });
    }

    // Email templates (same as simple system)
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

    this.rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });
  }

  async init() {
    console.log("📧 ENHANCED EMAIL SYSTEM");
    console.log("========================\n");

    try {
      // Load or create configuration
      await this.loadOrCreateConfig();

      // Setup authentication (try Gmail API first, fallback to App Password)
      await this.setupAuthentication();

      // Test email connectivity
      await this.testEmailConnectivity();

      console.log("✅ Enhanced email system initialized");
    } catch (error) {
      console.error("❌ Email system initialization failed:", error.message);
      throw error;
    }
  }

  async loadOrCreateConfig() {
    console.log("📂 Loading email configuration...");

    if (fs.existsSync(this.configFile)) {
      this.config = JSON.parse(fs.readFileSync(this.configFile, "utf8"));
      console.log("✅ Email configuration loaded");
    } else {
      console.log("⚠️ No configuration found. Creating new configuration...");
      await this.createConfiguration();
    }
  }

  async createConfiguration() {
    console.log("\n🔧 Email Configuration Setup");
    console.log("=============================");

    console.log("\n📋 Choose authentication method:");
    console.log("1. Gmail API (OAuth2) - Can send AND receive emails");
    console.log("2. Gmail App Password - Can only send emails (simpler)");

    const choice = await this.question("\n❓ Choose option (1 or 2): ");

    if (choice === "1") {
      console.log("\n📋 For Gmail API (OAuth2):");
      console.log("1. Go to https://console.cloud.google.com/");
      console.log("2. Create a new project or select existing one");
      console.log("3. Enable Gmail API");
      console.log("4. Create OAuth 2.0 credentials");
      console.log(
        "5. Download credentials.json and place in email_data/ folder"
      );

      const hasCredentials = await this.question(
        "\n❓ Do you have credentials.json ready? (y/n): "
      );

      if (hasCredentials.toLowerCase() !== "y") {
        console.log(
          "📋 Please get Gmail API credentials first, then run setup again"
        );
        process.exit(0);
      }

      this.config = {
        authMethod: "gmail_api",
        email: await this.question("📧 Enter your Gmail address: "),
        testEmail: await this.question("🧪 Enter test email address: "),
        companyName: await this.question("🏢 Enter your company name: "),
        createdAt: new Date().toISOString(),
      };
    } else {
      console.log("\n📋 For Gmail App Password:");
      console.log("1. Go to your Google Account settings");
      console.log("2. Enable 2-Step Verification if not already enabled");
      console.log("3. Go to Security → App passwords");
      console.log("4. Generate an app password for 'Mail'");
      console.log(
        "5. Use that password below (not your regular Gmail password)"
      );

      this.config = {
        authMethod: "app_password",
        email: await this.question("📧 Enter your Gmail address: "),
        appPassword: await this.question("🔑 Enter your Gmail App Password: "),
        testEmail: await this.question("🧪 Enter test email address: "),
        companyName: await this.question("🏢 Enter your company name: "),
        smtp: {
          host: "smtp.gmail.com",
          port: 587,
          secure: false,
        },
        createdAt: new Date().toISOString(),
      };
    }

    fs.writeFileSync(this.configFile, JSON.stringify(this.config, null, 2));
    console.log("✅ Email configuration saved");
  }

  async setupAuthentication() {
    console.log("🔐 Setting up authentication...");

    if (this.config.authMethod === "gmail_api") {
      await this.setupGmailAPI();
    } else {
      await this.setupAppPassword();
    }
  }

  async setupGmailAPI() {
    console.log("🔐 Setting up Gmail API authentication...");

    if (!fs.existsSync(this.credentialsFile)) {
      throw new Error(
        "Gmail API credentials file not found. Please add credentials.json to email_data/"
      );
    }

    const credentials = JSON.parse(
      fs.readFileSync(this.credentialsFile, "utf8")
    );

    console.log("🔍 Credentials file structure:", Object.keys(credentials));

    // Handle different credential file structures
    let client_secret, client_id, redirect_uris;

    if (credentials.installed) {
      // Desktop application format
      ({ client_secret, client_id, redirect_uris } = credentials.installed);
    } else if (credentials.web) {
      // Web application format
      ({ client_secret, client_id } = credentials.web);
      redirect_uris = credentials.web.redirect_uris || [
        "http://localhost:3000",
      ];
    } else if (credentials.client_secret && credentials.client_id) {
      // Direct format
      client_secret = credentials.client_secret;
      client_id = credentials.client_id;
      redirect_uris = credentials.redirect_uris || ["http://localhost:3000"];
    } else {
      throw new Error(
        "Invalid credentials file format. Expected 'installed', 'web', or direct client credentials."
      );
    }
    this.oAuth2Client = new google.auth.OAuth2(
      client_id,
      client_secret,
      redirect_uris[0]
    );

    // Load existing token or get new one
    if (fs.existsSync(this.tokenFile)) {
      const token = JSON.parse(fs.readFileSync(this.tokenFile, "utf8"));
      this.oAuth2Client.setCredentials(token);
      console.log("✅ Gmail API token loaded from file");
    } else {
      await this.getNewToken();
    }

    // Setup Gmail API
    this.gmail = google.gmail({ version: "v1", auth: this.oAuth2Client });

    // Setup nodemailer transporter for sending
    this.transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        type: "OAuth2",
        user: this.config.email,
        clientId: client_id,
        clientSecret: client_secret,
        refreshToken: this.oAuth2Client.credentials.refresh_token,
        accessToken: this.oAuth2Client.credentials.access_token,
      },
    });

    this.isAuthenticated = true;
    console.log("✅ Gmail API authentication setup complete");
  }

  async setupAppPassword() {
    console.log("🔐 Setting up App Password authentication...");

    this.transporter = nodemailer.createTransport({
      host: this.config.smtp.host,
      port: this.config.smtp.port,
      secure: this.config.smtp.secure,
      auth: {
        user: this.config.email,
        pass: this.config.appPassword,
      },
    });

    this.isAuthenticated = true;
    console.log("✅ App Password authentication setup complete");
  }

  async getNewToken() {
    console.log("🔑 Getting new Gmail API token...");

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

    const authCode = await this.question("🔑 Enter authorization code: ");

    try {
      const { tokens } = await this.oAuth2Client.getToken(authCode);
      this.oAuth2Client.setCredentials(tokens);

      fs.writeFileSync(this.tokenFile, JSON.stringify(tokens, null, 2));
      console.log("✅ New token saved");
    } catch (error) {
      console.error("❌ Failed to get token:", error.message);
      throw error;
    }
  }

  async testEmailConnectivity() {
    console.log("🧪 Testing email connectivity...");

    try {
      // Test sending capability
      await this.transporter.verify();
      console.log("✅ Email sending capability verified");

      // Test receiving capability (if Gmail API is available)
      if (this.gmail) {
        const profile = await this.gmail.users.getProfile({ userId: "me" });
        console.log(
          `✅ Email receiving capability verified: ${profile.data.emailAddress}`
        );
      } else {
        console.log("⚠️ Email receiving not available (App Password mode)");
      }

      return true;
    } catch (error) {
      console.error("❌ Email connectivity test failed:", error.message);
      throw error;
    }
  }

  // Send email (same as simple system)
  async sendEmail(to, subject, body, options = {}) {
    if (!this.isAuthenticated) {
      throw new Error("Email system not authenticated");
    }

    console.log(`📧 Sending email to: ${to}`);
    console.log(`📝 Subject: ${subject}`);

    const mailOptions = {
      from: this.config.email,
      to: to,
      subject: subject,
      html: body,
      text: body.replace(/<[^>]*>/g, ""), // Strip HTML for text version
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

  // Send templated email (same as simple system)
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

  // NEW: Receive emails (Gmail API only)
  async receiveEmails(maxResults = 10) {
    if (!this.gmail) {
      console.log("⚠️ Cannot receive emails in App Password mode.");
      return [];
    }

    console.log(`📥 Receiving emails (max: ${maxResults})...`);

    try {
      const response = await this.gmail.users.messages.list({
        userId: "me",
        q: "is:unread", // Only fetch unread emails
        maxResults: maxResults,
      });

      const messages = response.data.messages || [];
      if (messages.length === 0) {
        console.log("📭 No new unread emails found.");
        return [];
      }

      const emails = await Promise.all(
        messages.map((msg) => this.getEmailDetails(msg.id))
      );

      console.log(`✅ Received ${emails.length} emails`);

      // Mark emails as read after fetching
      await this.markEmailsAsRead(emails.map((email) => email.id));

      return emails;
    } catch (error) {
      console.error(`❌ Email receiving failed: ${error.message}`);
      throw error;
    }
  }

  async markEmailsAsRead(messageIds) {
    if (!this.gmail || messageIds.length === 0) {
      return;
    }

    console.log(`✔️ Marking ${messageIds.length} email(s) as read...`);

    try {
      await this.gmail.users.messages.batchModify({
        userId: "me",
        requestBody: {
          ids: messageIds,
          removeLabelIds: ["UNREAD"],
        },
      });
      console.log("✅ Emails marked as read.");
    } catch (error) {
      console.error("❌ Failed to mark emails as read:", error.message);
      // We don't re-throw here, as the primary goal (receiving) was successful
    }
  }

  // NEW: Get detailed email information
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

  // NEW: Extract email body
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

  // NEW: Get header value
  getHeader(headers, name) {
    const header = headers.find((h) => h.name === name);
    return header ? header.value : null;
  }

  // NEW: Categorize email
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

  // NEW: Detect email priority
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

  // NEW: Check if email needs auto-reply
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

  // NEW: Send auto-reply
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

  // NEW: Process incoming emails
  async processIncomingEmails() {
    if (!this.gmail) {
      console.log("⚠️ Email receiving not available in App Password mode");
      return [];
    }

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
    let records = [];
    if (fs.existsSync(this.recordsFile)) {
      records = JSON.parse(fs.readFileSync(this.recordsFile, "utf8"));
    }

    records.push(record);
    fs.writeFileSync(this.recordsFile, JSON.stringify(records, null, 2));
  }

  // Get email statistics
  getEmailStats() {
    if (!fs.existsSync(this.recordsFile)) {
      return {
        total: 0,
        sent: 0,
        received: 0,
        byCategory: {},
        byPriority: {},
      };
    }

    const records = JSON.parse(fs.readFileSync(this.recordsFile, "utf8"));

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

  // Question helper
  question(prompt) {
    return new Promise((resolve) => {
      this.rl.question(prompt, resolve);
    });
  }

  // Run enhanced email demo
  async runEmailDemo() {
    console.log("\n🎬 ENHANCED EMAIL SYSTEM DEMO");
    console.log("==============================\n");

    // Test 1: Send a simple email
    console.log("📧 Test 1: Sending simple email");
    console.log("--------------------------------");

    try {
      const result = await this.sendEmail(
        this.config.testEmail,
        "Test Email from Enhanced Fractal Agent System",
        `
        <h2>Hello from the Enhanced Fractal Agent System!</h2>
        <p>This is a test email sent by our enhanced email integration system.</p>
        <p><strong>Features tested:</strong></p>
        <ul>
          <li>Email sending via ${this.config.authMethod}</li>
          <li>Email templates with variables</li>
          <li>Email record tracking</li>
          ${
            this.gmail
              ? "<li>Email receiving capability</li>"
              : "<li>App Password mode (sending only)</li>"
          }
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
        this.config.testEmail,
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

    // Test 3: Receive and process emails (Gmail API only)
    if (this.gmail) {
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
    } else {
      console.log(
        "\n📥 Test 3: Email receiving (not available in App Password mode)"
      );
      console.log(
        "------------------------------------------------------------------------"
      );
      console.log("⚠️ Email receiving requires Gmail API setup");
      console.log(
        "📋 To enable email receiving, run setup again and choose Gmail API option"
      );
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

    console.log("\n✅ Enhanced email system demo completed!");

    if (this.gmail) {
      console.log(
        "\n📧 Check your test email inbox to verify the emails were received!"
      );
      console.log("📥 Check the console output above to see received emails!");
    } else {
      console.log(
        "\n📧 Check your test email inbox to verify the emails were received!"
      );
      console.log("📥 To receive emails, set up Gmail API authentication");
    }
  }

  // Close readline interface
  close() {
    this.rl.close();
  }
}

// Run enhanced email system
async function main() {
  const emailSystem = new EnhancedEmailSystem();

  try {
    await emailSystem.init();
    await emailSystem.runEmailDemo();
  } catch (error) {
    console.error("❌ Email system error:", error.message);
  } finally {
    emailSystem.close();
  }
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = { EnhancedEmailSystem };
