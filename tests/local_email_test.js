const { google } = require("googleapis");
const nodemailer = require("nodemailer");
const fs = require("fs");
const path = require("path");
const axios = require("axios");

/**
 * Local Email Test System
 * Tests email receiving, categorization, and response generation locally
 */

class LocalEmailTest {
  constructor() {
    this.gmail = null;
    this.oAuth2Client = null;
    this.transporter = null;
    this.processedLabelId = "Label_1"; // From our label setup
    this.openaiApiKey = process.env.OPENAI_API_KEY;
  }

  async init() {
    console.log("🚀 Initializing Local Email Test System...");

    try {
      // Load credentials
      const credentials = JSON.parse(
        fs.readFileSync("email_data/credentials.json", "utf8")
      );
      const { client_secret, client_id, redirect_uris } =
        credentials.installed || credentials.web || credentials;

      this.oAuth2Client = new google.auth.OAuth2(
        client_id,
        client_secret,
        redirect_uris[0]
      );

      // Load token
      if (fs.existsSync("email_data/token.json")) {
        const token = JSON.parse(
          fs.readFileSync("email_data/token.json", "utf8")
        );
        this.oAuth2Client.setCredentials(token);
      
        // Verify token is valid by making a simple API call
        try {
          await this.gmail.users.getProfile({ userId: "me" });
          console.log("✅ Gmail API token loaded and verified");
        } catch (tokenError) {
          if (tokenError.message.includes("invalid_grant")) {
            console.error("❌ Gmail API token is invalid or has been revoked.");
            console.error("💡 Run the following command to get a new token:");
            console.error("   node tests/gmail_setup.js\n");
            throw new Error("Invalid token - needs re-authentication");
          }
          throw tokenError;
        }
      } else {
        throw new Error("Gmail API token not found");
      }

      this.gmail = google.gmail({ version: "v1", auth: this.oAuth2Client });

      // Setup nodemailer
      this.transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          type: "OAuth2",
          user: "pragmagen@gmail.com",
          clientId: client_id,
          clientSecret: client_secret,
          refreshToken: this.oAuth2Client.credentials.refresh_token,
          accessToken: this.oAuth2Client.credentials.access_token,
        },
      });

      console.log("✅ Local email test system initialized");
    } catch (error) {
      console.error("❌ Failed to initialize:", error.message);
      throw error;
    }
  }

  async categorizeEmailWithAI(email) {
    console.log("🤖 Using AI to categorize email...");

    const prompt = `Analyze this email and categorize it. Here are some examples:

Email: "I need help with my account login"
Category: "support", Priority: "medium"

Email: "Can you give me a quote for your services?"
Category: "sales", Priority: "medium"

Email: "URGENT: System is down and customers are affected"
Category: "technical", Priority: "high"

Email: "There's a bug in the API that's causing errors"
Category: "technical", Priority: "medium"

Email: "Just wanted to say thanks for the great service"
Category: "general", Priority: "low"

Now analyze this email:
From: ${email.from}
Subject: ${email.subject}
Body: ${email.body.substring(0, 500)}...

Respond with a JSON object containing:
- category: "support", "sales", "technical", "urgent", or "general"
- priority: "high", "medium", or "low"
- reasoning: brief explanation of the categorization`;

    try {
      const response = await axios.post(
        "https://api.openai.com/v1/chat/completions",
        {
          model: "gpt-4o-mini",
          response_format: { type: "json_object" },
          messages: [
            {
              role: "user",
              content: prompt,
            },
          ],
        },
        {
          headers: {
            Authorization: `Bearer ${this.openaiApiKey}`,
            "Content-Type": "application/json",
          },
        }
      );

      const result = JSON.parse(response.data.choices[0].message.content);
      console.log(
        `✅ AI Categorization: ${result.category} (${result.priority}) - ${result.reasoning}`
      );

      return {
        category: result.category,
        priority: result.priority,
        reasoning: result.reasoning,
      };
    } catch (error) {
      console.error("❌ AI categorization failed:", error.message);
      // Fallback to basic categorization
      return this.categorizeEmailFallback(email);
    }
  }

  categorizeEmailFallback(email) {
    console.log("⚠️ Using fallback categorization...");

    const subject = email.subject.toLowerCase();
    const body = email.body.toLowerCase();

    let category = "general";
    let priority = "low";

    // Basic categorization logic
    if (
      subject.includes("support") ||
      subject.includes("help") ||
      subject.includes("issue")
    ) {
      category = "support";
    } else if (
      subject.includes("quote") ||
      subject.includes("pricing") ||
      subject.includes("demo")
    ) {
      category = "sales";
    } else if (
      subject.includes("technical") ||
      subject.includes("bug") ||
      subject.includes("error")
    ) {
      category = "technical";
    }

    if (
      subject.includes("urgent") ||
      subject.includes("emergency") ||
      subject.includes("critical")
    ) {
      priority = "high";
      if (category === "general") category = "urgent";
    } else if (subject.includes("important") || subject.includes("priority")) {
      priority = "medium";
    }

    return { category, priority, reasoning: "Fallback categorization" };
  }

  async generateResponseWithAI(email, categorization) {
    console.log("🤖 Generating AI response...");

    const prompt = `You are a friendly, professional email responder for PragmaGen Systems, a cool San Francisco tech startup. 
    
Your personality should be:
- Professional but warm and human
- Tech-savvy but approachable  
- Enthusiastic about helping people
- Slightly whimsical and creative
- Confident but not arrogant
- Quick to acknowledge and appreciate the person reaching out

Email details:
From: ${email.from}
Subject: ${email.subject}
Body: ${email.body.substring(0, 800)}...
Category: ${categorization.category}
Priority: ${categorization.priority}
Reasoning: ${categorization.reasoning}

Generate a custom email response that:
1. Acknowledges their message warmly
2. Addresses their specific inquiry or comment
3. Provides appropriate next steps based on category
4. Maintains a friendly, startup-y tone
5. Includes relevant ticket/lead ID for tracking

Respond with a JSON object containing:
- subject: Custom subject line (can be creative but professional)
- greeting: Personalized greeting
- body: Main email body with personality
- signature: Professional but friendly signature
- next_steps: What happens next
- urgency_level: "immediate", "soon", or "standard" based on priority`;

    try {
      const response = await axios.post(
        "https://api.openai.com/v1/chat/completions",
        {
          model: "gpt-4o-mini",
          response_format: { type: "json_object" },
          messages: [
            {
              role: "user",
              content: prompt,
            },
          ],
        },
        {
          headers: {
            Authorization: `Bearer ${this.openaiApiKey}`,
            "Content-Type": "application/json",
          },
        }
      );

      const result = JSON.parse(response.data.choices[0].message.content);
      console.log(`✅ AI Response generated: ${result.subject}`);

      // Create the full email
      const ticketId = `${categorization.category.toUpperCase()}-${Date.now()}`;
      const customerName = email.from.split("@")[0];

      const emailBody = `${result.greeting}

${result.body}

${result.next_steps}

${result.signature}

---
Ticket ID: ${ticketId} | Priority: ${categorization.priority} | Urgency: ${result.urgency_level}`;

      const emailResponse = {
        to: email.from,
        subject: result.subject,
        text: emailBody,
        html: emailBody.replace(/\n/g, "<br>"),
      };
      
      console.log("📧 Generated email response:", JSON.stringify(emailResponse, null, 2));
      return emailResponse;
    } catch (error) {
      console.error("❌ AI response generation failed:", error.message);
      // Fallback to basic template
      return this.generateResponseFallback(email, categorization);
    }
  }

  generateResponseFallback(email, categorization) {
    console.log("⚠️ Using fallback response generation...");

    const customerName = email.from.split("@")[0];
    const ticketId = `${categorization.category.toUpperCase()}-${Date.now()}`;

    let subject, body, signature;

    switch (categorization.category) {
      case "support":
        subject = `Re: ${email.subject} - We're on it! 🚀`;
        body = `Hey ${customerName}! 👋

Thanks for reaching out about "${email.subject}" - we love hearing from our users and we're here to help!

I've got your back on this one. Our support team is already taking a look and we'll get you sorted out pronto.`;
        signature = `Cheers,
The PragmaGen Crew 🎉`;
        break;

      case "sales":
        subject = `Re: ${email.subject} - Let's make something awesome! 💫`;
        body = `Hey ${customerName}! ✨

Thanks for your interest in what we're building! We're stoked you reached out about "${email.subject}".

Our sales team is pumped to chat with you and see how we can help bring your vision to life.`;
        signature = `Can't wait to connect!
The PragmaGen Team 🚀`;
        break;

      case "technical":
        subject = `Re: ${email.subject} - Our devs are on it! 🔧`;
        body = `Hey ${customerName}! 👨‍💻

Thanks for the heads up about "${email.subject}" - our engineering team loves diving into technical challenges like this!

We're already investigating and we'll get back to you with some solid solutions.`;
        signature = `Happy coding!
The PragmaGen Dev Team 🛠️`;
        break;

      case "urgent":
        subject = `Re: ${email.subject} - URGENT - We're on it ASAP! 🚨`;
        body = `Hey ${customerName}! 

We got your urgent message about "${email.subject}" and we're treating this as top priority!

Our senior team is already mobilized and we'll be in touch within the hour.`;
        signature = `We've got your back!
The PragmaGen Emergency Response Team 🚨`;
        break;

      default:
        subject = `Re: ${email.subject} - Thanks for reaching out! 🙌`;
        body = `Hey ${customerName}! 

Thanks for your message about "${email.subject}" - we appreciate you taking the time to connect with us!

We're looking into this and will get back to you soon with some good news.`;
        signature = `Stay awesome!
The PragmaGen Team ✨`;
    }

    const emailBody = `${body}

Ticket ID: ${ticketId} | Priority: ${categorization.priority}

${signature}`;

    return {
      to: email.from,
      subject: subject,
      text: emailBody,
      html: emailBody.replace(/\n/g, "<br>"),
    };
  }

  async checkForNewEmails() {
    console.log("📥 Checking for new emails...");

    try {
      const response = await this.gmail.users.messages.list({
        userId: "me",
        q: 'is:unread -label:"Processed by Node-RED"',
        maxResults: 5,
      });

      const messages = response.data.messages || [];

      if (messages.length === 0) {
        console.log("📭 No new emails found");
        return;
      }

      console.log(`📧 Found ${messages.length} new email(s)`);

      for (const message of messages) {
        await this.processEmail(message.id);
      }
    } catch (error) {
      console.error("❌ Error checking emails:", error.message);
      
      // Handle invalid token errors specifically
      if (error.message.includes("invalid_grant")) {
        console.error("\n❌ Gmail API token is invalid or has been revoked.");
        console.error("💡 Run the following command to get a new token:");
        console.error("   node tests/gmail_setup.js\n");
      }
    }
  }

  async processEmail(messageId) {
    try {
      console.log(`📧 Processing email: ${messageId}`);

      // Get email details
      const response = await this.gmail.users.messages.get({
        userId: "me",
        id: messageId,
      });

      const email = this.parseEmailMessage(response.data);
      console.log(`📨 From: ${email.from}, Subject: ${email.subject}`);

      // Categorize with AI
      const categorization = await this.categorizeEmailWithAI(email);

      // Generate response
      const responseEmail = await this.generateResponseWithAI(
        email,
        categorization
      );

      // Send response
      await this.sendEmail(responseEmail);

      // Mark as processed
      await this.markEmailAsProcessed(messageId);

      console.log(`✅ Email processed and response sent`);
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

  async sendEmail(emailData) {
    try {
      console.log("📤 Attempting to send email via Gmail API...");
      console.log("📧 Email data:", JSON.stringify(emailData, null, 2));
      
      // Create email content for Gmail API
      const emailContent = `From: pragmagen@gmail.com
To: ${emailData.to}
Subject: ${emailData.subject}
Content-Type: text/html; charset=utf-8

${emailData.html}`;

      // Encode the email in base64
      const encodedEmail = Buffer.from(emailContent).toString("base64")
        .replace(/\+/g, "-")
        .replace(/\//g, "_")
        .replace(/=+$/, "");

      console.log("📤 Sending via Gmail API...");

      // Send email via Gmail API
      const result = await this.gmail.users.messages.send({
        userId: "me",
        requestBody: {
          raw: encodedEmail
        }
      });

      console.log(`✅ Email sent successfully via Gmail API: ${result.data.id}`);
      return result.data;
    } catch (error) {
      console.error("❌ Failed to send email via Gmail API:");
      console.error("   Error message:", error.message);
      console.error("   Error code:", error.code);
      console.error("   Error stack:", error.stack);
      
      if (error.response) {
        console.error("   Response data:", error.response.data);
        console.error("   Response status:", error.response.status);
      }
      throw error;
    }
  }

  async markEmailAsProcessed(messageId) {
    try {
      await this.gmail.users.messages.modify({
        userId: "me",
        id: messageId,
        requestBody: {
          addLabelIds: [this.processedLabelId],
          removeLabelIds: ["UNREAD"], // Mark as read
        },
      });

      console.log(`✅ Marked email ${messageId} as processed and read`);
    } catch (error) {
      console.error(`❌ Failed to mark email as processed:`, error.message);
    }
  }

  async runTest() {
    console.log("🧪 Running local email test...");
    console.log(
      "📧 Send an email to pragmagen@gmail.com and watch for the response!"
    );

    // Initial check
    await this.checkForNewEmails();

    // Set up polling every 30 seconds for testing
    setInterval(async () => {
      await this.checkForNewEmails();
    }, 30000);

    console.log("🔄 Polling every 30 seconds. Press Ctrl+C to stop.");
  }
}

// Run the test
async function main() {
  if (!process.env.OPENAI_API_KEY) {
    console.error("❌ OPENAI_API_KEY environment variable not set");
    console.log("💡 Set it with: export OPENAI_API_KEY=your_api_key");
    process.exit(1);
  }

  const test = new LocalEmailTest();

  try {
    await test.init();
    await test.runTest();
  } catch (error) {
    console.error("❌ Test failed:", error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = LocalEmailTest;
