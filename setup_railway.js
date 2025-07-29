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

// Create a working flows configuration file that doesn't rely on external email nodes
const flowsConfig = [
  {
    id: "email_processing_tab",
    type: "tab",
    label: "Email Processing System",
    disabled: false,
    info: "AI-powered email processing with Node-RED",
  },
  {
    id: "email_poll_trigger",
    type: "inject",
    z: "email_processing_tab",
    name: "Poll Emails Every 30s",
    props: [
      {
        p: "payload",
      },
    ],
    repeat: "30",
    crontab: "",
    once: false,
    onceDelay: 0.1,
    topic: "",
    payload: "poll",
    payloadType: "str",
    x: 150,
    y: 100,
    wires: [["email_processor"]],
  },
  {
    id: "email_processor",
    type: "function",
    z: "email_processing_tab",
    name: "Process Emails",
    func: `// Process emails using our existing email system
const { LocalEmailTest } = require('./local_email_test.js');

// Initialize email system
const emailSystem = new LocalEmailTest();

// Process emails
emailSystem.init().then(() => {
    return emailSystem.checkForNewEmails();
}).then((result) => {
    console.log('Email processing result:', result);
    msg.payload = result;
    node.send(msg);
}).catch((error) => {
    console.error('Email processing error:', error);
    msg.payload = { error: error.message };
    node.send(msg);
});

return null;`,
    outputs: 1,
    noerr: 0,
    initialize: "",
    finalize: "",
    libs: [],
    x: 350,
    y: 100,
    wires: [["email_logger"]],
  },
  {
    id: "email_logger",
    type: "file",
    z: "email_processing_tab",
    name: "Log Email Activity",
    filename: "/data/email_activity.log",
    appendNewline: true,
    createDir: false,
    overwriteFile: "false",
    encoding: "none",
    x: 550,
    y: 100,
    wires: [],
  },
  {
    id: "manual_email_trigger",
    type: "http in",
    z: "email_processing_tab",
    name: "Manual Email Check",
    url: "/check-emails",
    method: "post",
    upload: false,
    swaggerDoc: "",
    x: 150,
    y: 200,
    wires: [["email_processor"]],
  },
  {
    id: "health_check_tab",
    type: "tab",
    label: "System Health",
    disabled: false,
    info: "System monitoring and health checks",
  },
  {
    id: "health_check",
    type: "http in",
    z: "health_check_tab",
    name: "Health Check",
    url: "/health",
    method: "get",
    upload: false,
    swaggerDoc: "",
    x: 150,
    y: 100,
    wires: [["status_generator"]],
  },
  {
    id: "status_generator",
    type: "function",
    z: "health_check_tab",
    name: "Generate Status",
    func: `msg.payload = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'fractal-agent-system',
    version: '1.0.0',
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'production',
    railway: true,
    email_system: 'active'
};
return msg;`,
    outputs: 1,
    noerr: 0,
    initialize: "",
    finalize: "",
    libs: [],
    x: 350,
    y: 100,
    wires: [["health_response"]],
  },
  {
    id: "health_response",
    type: "http response",
    z: "health_check_tab",
    name: "Health Response",
    statusCode: "200",
    headers: {},
    x: 550,
    y: 100,
    wires: [],
  },
];

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
console.log(
  "📧 Manual email check at: https://your-app-name.railway.app/check-emails"
);
console.log(
  "📧 Gmail credentials configured:",
  !!process.env.GMAIL_USER && !!process.env.GMAIL_APP_PASSWORD
);
