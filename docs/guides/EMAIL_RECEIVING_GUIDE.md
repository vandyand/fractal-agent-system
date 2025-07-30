# 📥 Email Receiving Capabilities Guide

## ✅ Current Status

### **What We Have Now:**

- ✅ **Email Sending** - Working perfectly with Gmail App Passwords
- ✅ **Email Templates** - Customer support, order confirmation, newsletter
- ✅ **Email Tracking** - Statistics and message records
- ⚠️ **Email Receiving** - Requires Gmail API setup

## 🔄 Email System Options

### **Option 1: Simple Email System (Current)**

```bash
npm run simple:email
```

**Capabilities:**

- ✅ **Send emails** via Gmail App Password
- ✅ **Email templates** with variables
- ✅ **Email tracking** and statistics
- ❌ **Cannot receive emails**

**Setup:** Simple App Password authentication
**Best for:** Sending notifications, customer support, marketing emails

### **Option 2: Enhanced Email System (Full Features)**

```bash
npm run enhanced:email
```

**Capabilities:**

- ✅ **Send emails** via Gmail API or App Password
- ✅ **Receive emails** via Gmail API
- ✅ **Email categorization** (support, sales, general)
- ✅ **Priority detection** (high, medium, low)
- ✅ **Auto-reply** for urgent emails
- ✅ **Email processing** and workflow integration

**Setup:** Gmail API OAuth2 authentication
**Best for:** Full email automation, customer service, workflow integration

## 🚀 How to Enable Email Receiving

### **Step 1: Choose Authentication Method**

When you run `npm run enhanced:email`, you'll be prompted to choose:

```
📋 Choose authentication method:
1. Gmail API (OAuth2) - Can send AND receive emails
2. Gmail App Password - Can only send emails (simpler)
```

### **Step 2: Gmail API Setup (Option 1)**

If you choose Gmail API:

1. **Go to Google Cloud Console**

   - Visit: https://console.cloud.google.com/
   - Create a new project or select existing one

2. **Enable Gmail API**

   - Go to "APIs & Services" → "Library"
   - Search for "Gmail API"
   - Click "Enable"

3. **Create OAuth 2.0 Credentials**

   - Go to "APIs & Services" → "Credentials"
   - Click "Create Credentials" → "OAuth 2.0 Client IDs"
   - Choose "Desktop application"
   - Download the credentials JSON file

4. **Place Credentials File**

   - Save the downloaded file as `credentials.json`
   - Place it in the `email_data/` folder

5. **Run Enhanced Email Setup**
   ```bash
   npm run enhanced:email
   ```

### **Step 3: Authorization Process**

When you run the enhanced system:

1. **Visit Authorization URL**

   - The system will provide a Google authorization URL
   - Visit the URL in your browser
   - Grant permissions to your Gmail account

2. **Copy Authorization Code**

   - After granting permissions, you'll get an authorization code
   - Copy the code and paste it back into the terminal

3. **Token Saved**
   - The system will save the token for future use
   - No need to re-authorize unless token expires

## 📧 Email Receiving Features

### **1. Receive Emails**

```javascript
// Get recent emails from inbox
const emails = await emailSystem.receiveEmails(10);
```

**Returns:**

```javascript
[
  {
    id: "message_id",
    subject: "Email Subject",
    from: "sender@example.com",
    to: "your@email.com",
    date: "2025-07-27T19:45:23.456Z",
    snippet: "Email preview...",
    body: "Full email content...",
    category: "support",
    priority: "high",
    autoReplyNeeded: true,
  },
];
```

### **2. Email Categorization**

Automatically categorizes emails based on content:

- **Support** - Keywords: help, support, issue, problem, broken
- **Sales** - Keywords: purchase, buy, order, price, cost
- **General** - Keywords: info, question, inquiry, contact

### **3. Priority Detection**

Detects email priority based on keywords:

- **High Priority** - urgent, critical, emergency, asap
- **Medium Priority** - important, needed, required
- **Low Priority** - general, info, question

### **4. Auto-Reply System**

Automatically sends replies to urgent emails:

```javascript
// Auto-reply for urgent emails
if (email.autoReplyNeeded) {
  await emailSystem.sendAutoReply(email);
}
```

### **5. Email Processing Workflow**

```javascript
// Process incoming emails
const processedEmails = await emailSystem.processIncomingEmails();

// Each email is:
// - Categorized by type
// - Assigned priority level
// - Checked for auto-reply need
// - Saved to records
// - Ready for workflow integration
```

## 🔄 Integration with Task Management

### **Email-Driven Task Creation**

```javascript
// Create tasks from incoming emails
const emails = await emailSystem.receiveEmails(5);

for (const email of emails) {
  if (email.category === "support") {
    // Create support ticket task
    await taskManager.createTask({
      name: `Support: ${email.subject}`,
      type: "customer_support",
      priority: email.priority,
      description: email.body,
      customerEmail: email.from,
    });
  }
}
```

### **Email Notifications for Task Completion**

```javascript
// Send email when task completes
await emailSystem.sendTemplatedEmail(customerEmail, "customer_support", {
  customerName: customerName,
  ticketId: taskId,
  inquiry: inquiry,
  response: "Your issue has been resolved!",
  agentName: "AI Task Manager",
});
```

## 📊 Email Statistics

### **Enhanced Statistics**

```javascript
const stats = emailSystem.getEmailStats();
// Returns:
{
  total: 15,
  sent: 8,
  received: 7,
  byCategory: {
    support: 5,
    sales: 2,
    general: 8
  },
  byPriority: {
    high: 3,
    medium: 8,
    low: 4
  }
}
```

## 🎯 Business Applications

### **Customer Service Automation**

1. **Receive customer emails** automatically
2. **Categorize by issue type** (support, sales, general)
3. **Assign priority** based on urgency
4. **Create support tickets** in task management
5. **Send auto-replies** for urgent issues
6. **Track resolution** and follow up

### **Sales Lead Management**

1. **Monitor sales inquiries** in real-time
2. **Categorize leads** by product interest
3. **Assign priority** to hot leads
4. **Create sales tasks** for follow-up
5. **Send automated responses** with product info

### **Workflow Integration**

1. **Email triggers tasks** automatically
2. **Task completion sends emails** to customers
3. **Track customer communication** history
4. **Measure response times** and satisfaction
5. **Generate reports** on email activity

## 🚨 Troubleshooting

### **"Email receiving not available" Error**

- **Cause:** Using App Password mode instead of Gmail API
- **Solution:** Run `npm run enhanced:email` and choose Gmail API option

### **"Gmail API credentials not found" Error**

- **Cause:** Missing `credentials.json` file
- **Solution:** Download OAuth 2.0 credentials from Google Cloud Console

### **"Authorization failed" Error**

- **Cause:** Invalid authorization code or expired token
- **Solution:** Re-run setup and get new authorization code

### **"Permission denied" Error**

- **Cause:** Gmail API not enabled or insufficient permissions
- **Solution:** Enable Gmail API in Google Cloud Console

## 🎉 Success Indicators

### **Email Receiving is Working When:**

- ✅ **Gmail API connected** - Profile verification successful
- ✅ **Emails received** - Recent emails retrieved from inbox
- ✅ **Categorization working** - Emails properly categorized
- ✅ **Priority detection** - Urgency levels assigned
- ✅ **Auto-reply functioning** - Responses sent for urgent emails
- ✅ **Statistics updated** - Received emails counted

### **Current Status:**

- ✅ **Email Sending** - Fully functional
- ⚠️ **Email Receiving** - Available with Gmail API setup
- ✅ **Integration Ready** - Works with task management system

---

**🎯 To enable email receiving, run `npm run enhanced:email` and choose Gmail API authentication!**
