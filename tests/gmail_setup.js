#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const readline = require("readline");

class GmailSetup {
  constructor() {
    this.dataDir = "./email_data";
    this.credentialsFile = path.join(this.dataDir, "credentials.json");
    this.configFile = path.join(this.dataDir, "email_config.json");

    // Initialize data directory
    if (!fs.existsSync(this.dataDir)) {
      fs.mkdirSync(this.dataDir, { recursive: true });
    }

    this.rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });
  }

  async run() {
    console.log("🔧 GMAIL SETUP WIZARD");
    console.log("=====================\n");

    try {
      await this.setupCredentials();
      await this.setupConfiguration();
      await this.generateInstructions();

      console.log("\n✅ Gmail setup completed!");
      console.log("📧 You can now run: npm run email");
    } catch (error) {
      console.error("❌ Setup failed:", error.message);
    } finally {
      this.rl.close();
    }
  }

  async setupCredentials() {
    console.log("🔐 Step 1: Gmail API Credentials");
    console.log("================================");

    if (fs.existsSync(this.credentialsFile)) {
      console.log("✅ Credentials file already exists");
      return;
    }

    console.log("\n📋 To get Gmail API credentials:");
    console.log("1. Go to https://console.cloud.google.com/");
    console.log("2. Create a new project or select existing one");
    console.log("3. Enable Gmail API");
    console.log("4. Create OAuth 2.0 credentials");
    console.log("5. Download the credentials JSON file");
    console.log("6. Save it as 'credentials.json' in the email_data/ folder");

    console.log("\n📁 Expected file structure:");
    console.log("email_data/");
    console.log("  ├── credentials.json  (Gmail API credentials)");
    console.log("  └── email_config.json (Email configuration)");

    const answer = await this.question(
      "\n❓ Do you have the credentials.json file ready? (y/n): "
    );

    if (answer.toLowerCase() === "y") {
      console.log(
        "✅ Please place the credentials.json file in the email_data/ folder"
      );
      console.log("📂 Path: ./email_data/credentials.json");
    } else {
      console.log(
        "📋 Please follow the steps above to get your Gmail API credentials"
      );
      console.log("🔄 Run this setup again when you have the credentials file");
      process.exit(0);
    }
  }

  async setupConfiguration() {
    console.log("\n📧 Step 2: Email Configuration");
    console.log("===============================");

    const email = await this.question("📧 Enter your Gmail address: ");
    const testEmail = await this.question(
      "🧪 Enter test email address (for testing): "
    );
    const companyName = await this.question("🏢 Enter your company name: ");

    const config = {
      email: email,
      testEmail: testEmail,
      companyName: companyName,
      autoReplyEnabled: true,
      emailProcessingEnabled: true,
      maxEmailsPerBatch: 10,
      createdAt: new Date().toISOString(),
    };

    fs.writeFileSync(this.configFile, JSON.stringify(config, null, 2));
    console.log("✅ Email configuration saved");
  }

  async generateInstructions() {
    console.log("\n📋 Step 3: Setup Instructions");
    console.log("=============================");

    const instructions = `
# Gmail Email Integration Setup

## Files Created:
- \`email_data/credentials.json\` - Gmail API credentials (you need to add this)
- \`email_data/email_config.json\` - Email configuration

## Next Steps:

### 1. Add Gmail Credentials
Place your Gmail API credentials file at: \`./email_data/credentials.json\`

### 2. Install Dependencies
\`\`\`bash
npm install nodemailer googleapis
\`\`\`

### 3. Test Email Integration
\`\`\`bash
npm run email
\`\`\`

### 4. First Run Authentication
On first run, you'll need to:
1. Visit the provided authorization URL
2. Grant permissions to your Gmail account
3. Copy the authorization code
4. The system will save the token for future use

## Features Available:
- ✅ Send emails via Gmail
- ✅ Receive and process emails
- ✅ Email categorization (support, sales, general)
- ✅ Priority detection (high, medium, low)
- ✅ Auto-reply functionality
- ✅ Email templates
- ✅ Email statistics tracking

## Email Templates:
- Customer Support Response
- Order Confirmation
- Newsletter

## Processing Rules:
- Auto-categorization based on keywords
- Priority detection
- Automatic replies for urgent emails

## Integration with Task Management:
The email system integrates with the task management system to:
- Create tasks from incoming emails
- Send email notifications for task completion
- Process customer support workflows
- Handle order management emails
`;

    const instructionsFile = path.join(this.dataDir, "SETUP_INSTRUCTIONS.md");
    fs.writeFileSync(instructionsFile, instructions);
    console.log(
      "✅ Setup instructions saved to: email_data/SETUP_INSTRUCTIONS.md"
    );
  }

  question(prompt) {
    return new Promise((resolve) => {
      this.rl.question(prompt, resolve);
    });
  }
}

// Run Gmail setup
async function main() {
  const setup = new GmailSetup();
  await setup.run();
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = { GmailSetup };
