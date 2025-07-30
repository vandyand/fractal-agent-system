const express = require("express");
const LocalEmailTest = require("./local_email_test.js");

const app = express();
const PORT = process.env.EMAIL_PROCESSOR_PORT || 3000;

// Middleware
app.use(express.json());

// Initialize email system
let emailSystem = null;
let isInitialized = false;

async function initializeEmailSystem() {
  try {
    console.log("🔄 Initializing email system...");
    emailSystem = new LocalEmailTest();
    await emailSystem.init();
    isInitialized = true;
    console.log("✅ Email system initialized successfully");
    return true;
  } catch (error) {
    console.error("❌ Failed to initialize email system:", error);
    isInitialized = false;
    return false;
  }
}

// Email processing endpoint
app.post("/process-emails", async (req, res) => {
  try {
    // Initialize if not already done
    if (!isInitialized || !emailSystem) {
      const initSuccess = await initializeEmailSystem();
      if (!initSuccess) {
        return res.status(500).json({
          success: false,
          error: "Failed to initialize email system",
          timestamp: new Date().toISOString(),
        });
      }
    }

    console.log("📧 Processing emails...");
    const result = await emailSystem.checkForNewEmails();

    console.log("✅ Email processing complete:", result);
    res.json({
      success: true,
      timestamp: new Date().toISOString(),
      result: result,
    });
  } catch (error) {
    console.error("❌ Email processing error:", error);
    res.status(500).json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString(),
    });
  }
});

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({
    status: "healthy",
    service: "email-processor",
    timestamp: new Date().toISOString(),
    emailSystem: isInitialized ? "initialized" : "not_initialized",
    port: PORT,
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Email processor server running on port ${PORT}`);
  console.log(
    `📧 Email processing endpoint: http://localhost:${PORT}/process-emails`
  );
  console.log(`🏥 Health check: http://localhost:${PORT}/health`);
});

// Initialize email system on startup
initializeEmailSystem().then((success) => {
  if (success) {
    console.log("🎉 Email processor server ready!");
  } else {
    console.log(
      "⚠️ Email processor server started but email system not initialized"
    );
  }
});

module.exports = app;
