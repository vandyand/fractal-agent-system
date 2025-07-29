const fs = require("fs");
const path = require("path");

/**
 * Railway Setup Script
 * Configures Node-RED flows with environment variables for production deployment
 */

console.log("🚀 Setting up Node-RED for Railway deployment...");

// Check if we're in Railway environment
const isRailway =
  process.env.RAILWAY_ENVIRONMENT || process.env.RAILWAY_PROJECT_ID;

if (!isRailway) {
  console.log("⚠️ Not running in Railway environment, skipping setup");
  process.exit(0);
}

console.log("✅ Railway environment detected");

// Create Node-RED data directory if it doesn't exist
const dataDir = "/data";
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
  console.log(`✅ Created data directory: ${dataDir}`);
}

// Create a simple flows configuration file
const flowsConfig = {
  flows: [
    {
      id: "email_triggered_tab",
      type: "tab",
      label: "Email Processing System",
      disabled: false,
      info: "AI-powered email processing with Node-RED",
    },
    {
      id: "email_in_node",
      type: "email in",
      z: "email_triggered_tab",
      name: "Gmail Receiver",
      server: "imap.gmail.com",
      port: "993",
      tls: true,
      tlsOptions: {},
      autotls: "never",
      username: process.env.GMAIL_USER || "pragmagen@gmail.com",
      password: process.env.GMAIL_APP_PASSWORD || "",
      passwordType: "str",
      keepalive: "keepalive",
      poll: 30,
      pollInterval: 30,
      pollIntervalUnits: "seconds",
      filter: 'is:unread -label:"Processed by Node-RED"',
      markSeen: false,
      markRead: false,
      delete: false,
      deleteAfter: 0,
      x: 150,
      y: 100,
      wires: [["email_logger"]],
    },
    {
      id: "email_logger",
      type: "file",
      z: "email_triggered_tab",
      name: "Log All Emails",
      filename: "/data/email_logs.txt",
      appendNewline: true,
      createDir: false,
      overwriteFile: "false",
      encoding: "none",
      x: 350,
      y: 100,
      wires: [],
    },
    {
      id: "health_check",
      type: "http in",
      z: "system_status_tab",
      name: "Health Check",
      url: "/health",
      method: "get",
      upload: false,
      swaggerDoc: "",
      x: 150,
      y: 100,
      wires: [["health_response"]],
    },
    {
      id: "health_response",
      type: "http response",
      z: "system_status_tab",
      name: "Health Response",
      statusCode: "200",
      headers: {},
      x: 350,
      y: 100,
      wires: [],
    },
    {
      id: "status_generator",
      type: "function",
      z: "system_status_tab",
      name: "Generate Status",
      func: `msg.payload = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'fractal-agent-system',
    version: '1.0.0',
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'production',
    railway: true
};
return msg;`,
      outputs: 1,
      noerr: 0,
      initialize: "",
      finalize: "",
      libs: [],
      x: 250,
      y: 100,
      wires: [["health_response"]],
    },
  ],
};

// Write the flows configuration
const flowsPath = path.join(dataDir, "flows.json");
fs.writeFileSync(flowsPath, JSON.stringify(flowsConfig, null, 2));
console.log(`✅ Created flows configuration: ${flowsPath}`);

// Create a simple settings file
const settings = {
  uiPort: process.env.PORT || 1880,
  httpRoot: "/",
  credentialSecret: process.env.NODE_RED_SECRET || "railway-secret-key",
  userDir: dataDir,
  flowFile: "flows.json",
  logging: {
    console: {
      level: "info",
      metrics: false,
      audit: false,
    },
  },
  editorTheme: {
    projects: {
      enabled: false,
    },
  },
};

const settingsPath = path.join(dataDir, "settings.js");
fs.writeFileSync(
  settingsPath,
  `module.exports = ${JSON.stringify(settings, null, 2)};`
);
console.log(`✅ Created settings configuration: ${settingsPath}`);

console.log("🎉 Railway setup complete!");
console.log(
  "📧 Email system will be available at: https://your-app-name.railway.app"
);
console.log("🔧 Node-RED editor at: https://your-app-name.railway.app/red");
console.log("🏥 Health check at: https://your-app-name.railway.app/health");
