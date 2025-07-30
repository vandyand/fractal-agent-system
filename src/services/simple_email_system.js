#!/usr/bin/env node

const nodemailer = require("nodemailer");
const fs = require("fs");
const path = require("path");
const readline = require("readline");

class SimpleEmailSystem {
  constructor() {
    this.transporter = null;
    this.isAuthenticated = false;
    this.dataDir = "./email_data";
    this.configFile = path.join(this.dataDir, "simple_email_config.json");
    this.recordsFile = path.join(this.dataDir, "email_records.json");

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

    this.rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });
  }

  async init() {
    console.log("📧 SIMPLE EMAIL SYSTEM");
    console.log("======================\n");

    try {
      // Load or create configuration
      await this.loadOrCreateConfig();

      // Setup email transporter
      await this.setupTransporter();

      // Test email connectivity
      await this.testEmailConnectivity();

      console.log("✅ Simple email system initialized");
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

    console.log("\n📋 To use Gmail with App Password:");
    console.log("1. Go to your Google Account settings");
    console.log("2. Enable 2-Step Verification if not already enabled");
    console.log("3. Go to Security → App passwords");
    console.log("4. Generate an app password for 'Mail'");
    console.log("5. Use that password below (not your regular Gmail password)");

    const email = await this.question("\n📧 Enter your Gmail address: ");
    const appPassword = await this.question(
      "🔑 Enter your Gmail App Password: "
    );
    const testEmail = await this.question("🧪 Enter test email address: ");
    const companyName = await this.question("🏢 Enter your company name: ");

    this.config = {
      email: email,
      appPassword: appPassword,
      testEmail: testEmail,
      companyName: companyName,
      smtp: {
        host: "smtp.gmail.com",
        port: 587,
        secure: false,
      },
      createdAt: new Date().toISOString(),
    };

    fs.writeFileSync(this.configFile, JSON.stringify(this.config, null, 2));
    console.log("✅ Email configuration saved");
  }

  async setupTransporter() {
    console.log("🔐 Setting up email transporter...");

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
    console.log("✅ Email transporter configured");
  }

  async testEmailConnectivity() {
    console.log("🧪 Testing email connectivity...");

    try {
      await this.transporter.verify();
      console.log("✅ Email connectivity test passed");
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
      from: this.config.email,
      to: to,
      subject: subject,
      html: body,
      text: body.replace(/<[^>]*>/g, ''), // Strip HTML for text version
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
      };
    }

    const records = JSON.parse(fs.readFileSync(this.recordsFile, "utf8"));

    return {
      total: records.length,
      sent: records.filter((r) => r.type === "sent").length,
      received: records.filter((r) => r.type === "received").length,
    };
  }

  // Question helper
  question(prompt) {
    return new Promise((resolve) => {
      this.rl.question(prompt, resolve);
    });
  }

  // Run email demo
  async runEmailDemo() {
    console.log("\n🎬 SIMPLE EMAIL SYSTEM DEMO");
    console.log("============================\n");

    // Test 1: Send a simple email
    console.log("📧 Test 1: Sending simple email");
    console.log("--------------------------------");

    try {
      const result = await this.sendEmail(
        this.config.testEmail,
        "Test Email from Fractal Agent System",
        `
        <h2>Hello from the Fractal Agent System!</h2>
        <p>This is a test email sent by our AI-powered email integration system.</p>
        <p><strong>Features tested:</strong></p>
        <ul>
          <li>Gmail SMTP with App Password</li>
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

    // Test 3: Send order confirmation
    console.log("\n📧 Test 3: Sending order confirmation");
    console.log("--------------------------------------");

    try {
      const result = await this.sendTemplatedEmail(
        this.config.testEmail,
        "order_confirmation",
        {
          customerName: "Jane Smith",
          orderId: "ORD-67890",
          orderDate: new Date().toLocaleDateString(),
          totalAmount: "$299.99",
          orderItems: "Premium AI Assistant Package x1",
          companyName: this.config.companyName,
        }
      );
      console.log(`✅ Order confirmation sent: ${result.messageId}`);
    } catch (error) {
      console.log(`❌ Order confirmation failed: ${error.message}`);
    }

    // Show email statistics
    console.log("\n📊 Email Statistics:");
    console.log("====================");
    const stats = this.getEmailStats();
    console.log(`📧 Total Emails: ${stats.total}`);
    console.log(`📤 Sent: ${stats.sent}`);
    console.log(`📥 Received: ${stats.received}`);

    console.log("\n✅ Simple email system demo completed!");
    console.log(
      "\n📧 Check your test email inbox to verify the emails were received!"
    );
  }

  // Close readline interface
  close() {
    this.rl.close();
  }
}

// Run simple email system
async function main() {
  const emailSystem = new SimpleEmailSystem();

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

module.exports = { SimpleEmailSystem };
 