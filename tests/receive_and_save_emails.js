const fs = require("fs");
const path = require("path");
const { EnhancedEmailSystem } = require("./enhanced_email_system");

const OUTPUT_FILE = path.join(__dirname, "received_emails.log");

/**
 * A simple script to receive emails using the EnhancedEmailSystem
 * and append them to a log file.
 */
async function receiveAndSaveEmails() {
  console.log("🚀 Starting email receiving process...");

  const emailSystem = new EnhancedEmailSystem();

  try {
    // Initialize the email system (loads config, authenticates)
    await emailSystem.init();
    console.log("✅ Email system initialized.");

    // Receive new emails
    console.log("📥 Fetching new emails...");
    const receivedEmails = await emailSystem.receiveEmails({ maxResults: 10 });

    if (receivedEmails.length === 0) {
      console.log("📭 No new emails found.");
      return;
    }

    console.log(
      `📩 Found ${receivedEmails.length} new email(s). Processing...`
    );

    // Append new emails to the log file
    for (const email of receivedEmails) {
      const emailRecord = {
        receivedAt: new Date().toISOString(),
        id: email.id,
        from: email.from,
        subject: email.subject,
        snippet: email.snippet,
        body: email.body, // The full body is now available
      };
      const logEntry = JSON.stringify(emailRecord, null, 2) + "\\n---\\n";
      fs.appendFileSync(OUTPUT_FILE, logEntry);
      console.log(`✅ Saved email from "${email.from}" to ${OUTPUT_FILE}`);
    }
  } catch (error) {
    console.error("❌ An error occurred during the email receiving process:");
    console.error(error);
    process.exit(1);
  } finally {
    if (emailSystem) {
      await emailSystem.close();
    }
    console.log("🏁 Email receiving process finished.");
  }
}

receiveAndSaveEmails();
