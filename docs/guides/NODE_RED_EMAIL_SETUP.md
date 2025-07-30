# Node-RED Email Setup Guide

## Overview

Node-RED has built-in email nodes that are much more elegant than custom scripts. The `email in` node can automatically trigger flows when new emails arrive.

## Advantages of Node-RED Email Nodes

### ✅ **Built-in Features:**

- **Automatic polling** (every 30 seconds by default)
- **Automatic email marking** (mark as read after processing)
- **Built-in filtering** by sender, subject, content
- **Attachment handling**
- **Visual flow design** - no coding required
- **Real-time triggering** - flows run immediately when emails arrive

### ✅ **Easy Configuration:**

- **Visual interface** - drag and drop nodes
- **No custom scripts** needed
- **Built-in error handling**
- **Automatic reconnection** if connection drops

## Setup Instructions

### 1. Install Email Nodes (if not already installed)

```bash
# Navigate to Node-RED directory
cd ~/.node-red

# Install email nodes
npm install node-red-node-email
```

### 2. Configure Gmail App Password

Since we already have Gmail App Password set up, we can use it directly:

1. **Use your existing App Password** from `email_config.json`
2. **Server**: `imap.gmail.com`
3. **Port**: `993`
4. **Security**: `TLS`
5. **Username**: `venturevd@gmail.com`
6. **Password**: Your App Password (not your regular Gmail password)

### 3. Deploy the Email Triggered Flow

```bash
node fractal_agent_cli.js deploy email_triggered_flow.json
```

### 4. Configure the Email In Node

In Node-RED dashboard (`http://localhost:1880`):

1. **Open the "Email Triggered Actions" flow**
2. **Double-click the "Gmail Receiver" node**
3. **Configure settings:**
   - Server: `imap.gmail.com`
   - Port: `993`
   - TLS: ✅ Enabled
   - Username: `venturevd@gmail.com`
   - Password: Your App Password
   - Poll Interval: `30` seconds
   - **Filter**: `is:unread -label:"Processed by Node-RED"`
   - **Mark as Read**: ❌ Disabled (we use custom labels instead)
   - **Mark as Seen**: ❌ Disabled

### 5. Test the Flow

1. **Deploy the flow** (click "Deploy" button)
2. **Send a test email** to `venturevd@gmail.com`
3. **Watch the flow execute** automatically within 30 seconds
4. **Check the debug output** in the sidebar

## How the Flow Works

### 📧 **Email In Node**

- **Automatically polls** Gmail every 30 seconds
- **Fetches unread emails** only (excluding those with "Processed by Node-RED" label)
- **Does NOT mark emails as read** (preserves unread status)
- **Triggers the flow** for each new email

### 🏷️ **Custom Labeling System**

- **Creates custom label** "Processed by Node-RED" in Gmail
- **Adds label to emails** after processing (instead of marking as read)
- **Prevents reprocessing** of already handled emails
- **Preserves unread status** in your regular Gmail interface

### 🔍 **Email Filter**

- **Routes emails** based on sender domain
- **Gmail emails** → Gmail processor
- **Amazon emails** → Amazon processor
- **Google emails** → Google processor

### ⚙️ **Email Processors**

- **Extract email data** (from, subject, body)
- **Add metadata** (timestamp, priority, action)
- **Create notifications** for different email types

### 🎯 **Action Router**

- **Routes to specific actions** based on email type
- **Executes different commands** for different email sources
- **Logs actions** to separate files

### 📝 **Output Actions**

- **Logs to files** (`gmail_actions.log`, `amazon_orders.log`, etc.)
- **Shows notifications** in debug panel
- **Can trigger other flows** or external systems

## Customization Options

### 🔧 **Modify Polling Frequency**

- Change `pollInterval` in the email in node
- Options: 10, 30, 60, 300 seconds

### 📧 **Add More Email Filters**

- Add new rules to the switch node
- Filter by specific senders or subjects
- Create custom processors for different email types

### 🚀 **Add More Actions**

- **Send notifications** via Slack/Discord
- **Create database records**
- **Trigger external APIs**
- **Send SMS alerts**
- **Update dashboards**

### 📁 **Handle Attachments**

- The email in node automatically includes attachments
- Add attachment processing nodes
- Save attachments to specific folders

## Example Use Cases

### 🛒 **E-commerce Order Processing**

- **Amazon order emails** → Update inventory
- **Shipping confirmations** → Update tracking
- **Order cancellations** → Process refunds

### 🔐 **Security Monitoring**

- **Google security alerts** → Log security events
- **Login notifications** → Alert on suspicious activity
- **Password changes** → Update security records

### 📧 **Customer Support**

- **Support emails** → Create tickets
- **Inquiry emails** → Route to appropriate agents
- **Feedback emails** → Update customer records

## Troubleshooting

### ❌ **Connection Issues**

- Verify App Password is correct
- Check Gmail IMAP is enabled
- Ensure firewall allows port 993

### ❌ **No Emails Received**

- Check if emails are marked as read
- Verify polling interval is set correctly
- Check Node-RED logs for errors

### ❌ **Flow Not Triggering**

- Ensure flow is deployed
- Check debug node is enabled
- Verify email in node is configured correctly

## Next Steps

1. **Deploy the flow** and test with a real email
2. **Customize the actions** for your specific needs
3. **Add more email sources** (Outlook, Yahoo, etc.)
4. **Integrate with your fractal agents** for automated responses
5. **Add webhook notifications** for real-time alerts

This approach is much more robust and maintainable than custom scripts!
