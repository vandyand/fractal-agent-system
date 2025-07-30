# 📧 Gmail App Password Setup Guide

## 🔧 Quick Setup (No OAuth2 Required!)

This guide will help you set up email functionality using Gmail App Passwords - much simpler than OAuth2!

## 📋 Prerequisites

1. **Gmail Account** - Any Gmail account
2. **2-Step Verification** - Must be enabled on your Google Account
3. **App Password** - Generated from Google Account settings

## 🚀 Setup Steps

### Step 1: Enable 2-Step Verification

1. Go to [Google Account Settings](https://myaccount.google.com/)
2. Click on "Security" in the left sidebar
3. Under "Signing in to Google", click "2-Step Verification"
4. Follow the prompts to enable it

### Step 2: Generate App Password

1. Go to [Google Account Settings](https://myaccount.google.com/)
2. Click on "Security" in the left sidebar
3. Under "Signing in to Google", click "App passwords"
4. Select "Mail" from the dropdown
5. Click "Generate"
6. **Copy the 16-character password** (e.g., `abcd efgh ijkl mnop`)

### Step 3: Run Email Setup

```bash
npm run simple:email
```

The system will prompt you for:

- Your Gmail address
- The App Password (16-character code from Step 2)
- Test email address
- Company name

## 🧪 Testing Email Functionality

After setup, the system will automatically:

1. ✅ Test email connectivity
2. 📧 Send a test email
3. 📧 Send a templated customer support email
4. 📧 Send an order confirmation email
5. 📊 Show email statistics

## 📧 Email Templates Available

### Customer Support Response

```javascript
{
  customerName: 'John Doe',
  ticketId: 'TICKET-12345',
  inquiry: 'Product not working properly',
  response: 'We have identified the issue...',
  agentName: 'AI Support Agent'
}
```

### Order Confirmation

```javascript
{
  customerName: 'Jane Smith',
  orderId: 'ORD-67890',
  orderDate: '2025-07-27',
  totalAmount: '$299.99',
  orderItems: 'Premium AI Assistant Package x1',
  companyName: 'Your Company'
}
```

### Newsletter

```javascript
{
  subscriberName: 'Subscriber',
  date: '2025-07-27',
  content: 'Latest updates and news...',
  companyName: 'Your Company'
}
```

## 🔒 Security Notes

- **App Passwords are secure** - They only work for the specific app
- **No OAuth2 complexity** - Simple username/password authentication
- **Can be revoked** - You can delete app passwords anytime
- **No access to your main password** - App passwords are separate

## 🎯 Integration with Task Management

The email system integrates with the task management system:

```javascript
// Send email notification for task completion
await emailSystem.sendTemplatedEmail(customerEmail, "customer_support", {
  customerName: customerName,
  ticketId: taskId,
  inquiry: inquiry,
  response: "Your task has been completed successfully!",
  agentName: "AI Task Manager",
});
```

## 📊 Email Statistics

The system tracks:

- 📤 Total emails sent
- 📥 Total emails received
- 📊 Email templates used
- ⏱️ Timestamps and message IDs

## 🚨 Troubleshooting

### "Invalid login" Error

- Make sure you're using the **App Password**, not your regular Gmail password
- Ensure 2-Step Verification is enabled
- Check that the App Password was generated for "Mail"

### "Less secure app access" Error

- App Passwords bypass this restriction
- Make sure you're using the correct App Password

### "Authentication failed" Error

- Verify your Gmail address is correct
- Check that the App Password is copied correctly (16 characters)
- Try generating a new App Password

## 🎉 Success!

Once setup is complete, you'll see:

```
✅ Email connectivity test passed
✅ Test email sent: <message-id>
✅ Templated email sent: <message-id>
✅ Order confirmation sent: <message-id>
📧 Check your test email inbox to verify the emails were received!
```

## 📁 Files Created

- `email_data/simple_email_config.json` - Your email configuration
- `email_data/email_records.json` - Email sending/receiving records

## 🔄 Next Steps

1. **Test the emails** - Check your test email inbox
2. **Customize templates** - Modify email templates in the code
3. **Integrate with tasks** - Use email notifications in task workflows
4. **Add more templates** - Create new email templates for your business

---

**🎯 You now have a working email system that can send real emails via Gmail!**
