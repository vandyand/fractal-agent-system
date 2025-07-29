# Cloud Deployment Guide for Persistent Email System

## 🎯 **Overview**

This guide covers deploying the persistent email system to cloud platforms for 24/7 email responsiveness, even when your local machine is offline.

## 🏗️ **Architecture Components**

### **1. Cloud Email Service** (`cloud_email_service.js`)

- **24/7 email polling** (every 5 minutes)
- **Webhook endpoints** for external triggers
- **Email categorization** and routing
- **Queue management** for email processing

### **2. Multi-Agent Email Team** (`email_agent_team.json`)

- **Specialized agents** for different email types
- **Visual Node-RED flow** for email processing
- **Template-based responses** with AI integration
- **Priority-based routing** and escalation

### **3. Local Node-RED Instance**

- **Webhook receivers** for cloud service
- **Email response generation** and sending
- **Visual monitoring** and debugging

## 🚀 **Deployment Options**

### **Option 1: Railway (Recommended)**

Railway is perfect for this use case - simple deployment, automatic scaling, and reasonable pricing.

#### **Setup Steps:**

1. **Create Railway Account**

   ```bash
   # Install Railway CLI
   npm install -g @railway/cli

   # Login to Railway
   railway login
   ```

2. **Prepare for Deployment**

   ```bash
   # Create package.json for cloud service
   {
     "name": "pragmagen-email-service",
     "version": "1.0.0",
     "main": "cloud_email_service.js",
     "scripts": {
       "start": "node cloud_email_service.js"
     },
     "dependencies": {
       "express": "^4.18.2",
       "googleapis": "^128.0.0",
       "nodemailer": "^6.9.7"
     },
     "engines": {
       "node": "18.x"
     }
   }
   ```

3. **Set Environment Variables**

   ```bash
   # In Railway dashboard or CLI
   GMAIL_CLIENT_ID=your_client_id
   GMAIL_CLIENT_SECRET=your_client_secret
   GMAIL_USER=pragmagen@gmail.com
   GMAIL_TOKEN={"access_token":"...","refresh_token":"..."}
   NODE_RED_WEBHOOK_URL=http://your-node-red-url:1880/webhook
   ```

4. **Deploy**
   ```bash
   railway init
   railway up
   ```

### **Option 2: Heroku**

#### **Setup Steps:**

1. **Create Heroku App**

   ```bash
   # Install Heroku CLI
   # Create app
   heroku create pragmagen-email-service
   ```

2. **Add Buildpack**

   ```bash
   heroku buildpacks:set heroku/nodejs
   ```

3. **Set Environment Variables**

   ```bash
   heroku config:set GMAIL_CLIENT_ID=your_client_id
   heroku config:set GMAIL_CLIENT_SECRET=your_client_secret
   heroku config:set GMAIL_USER=pragmagen@gmail.com
   heroku config:set GMAIL_TOKEN='{"access_token":"...","refresh_token":"..."}'
   heroku config:set NODE_RED_WEBHOOK_URL=http://your-node-red-url:1880/webhook
   ```

4. **Deploy**
   ```bash
   git push heroku main
   ```

### **Option 3: AWS Lambda + API Gateway**

#### **Setup Steps:**

1. **Create Lambda Function**

   ```javascript
   // lambda_function.js
   const CloudEmailService = require("./cloud_email_service");

   exports.handler = async (event) => {
     const service = new CloudEmailService();
     return service.handleRequest(event);
   };
   ```

2. **Set Environment Variables**

   - GMAIL_CLIENT_ID
   - GMAIL_CLIENT_SECRET
   - GMAIL_USER
   - GMAIL_TOKEN
   - NODE_RED_WEBHOOK_URL

3. **Configure API Gateway**
   - Create REST API
   - Add routes for `/health`, `/webhook/email`, `/trigger-email-check`
   - Set up CloudWatch Events for periodic triggering

## 🔧 **Local Setup for Node-RED Integration**

### **1. Deploy Email Agent Team Flow**

```bash
node fractal_agent_cli.js deploy email_agent_team.json
```

### **2. Configure Webhook URLs**

Update the webhook URLs in the flow to point to your cloud service:

- `http://your-railway-app.railway.app/webhook/email`
- `http://your-heroku-app.herokuapp.com/webhook/email`

### **3. Test the Integration**

```bash
# Test webhook endpoint
curl -X POST http://your-cloud-service/webhook/email \
  -H "Content-Type: application/json" \
  -d '{"action": "process_emails"}'
```

## 📊 **Monitoring and Management**

### **Health Checks**

```bash
# Check service health
curl http://your-cloud-service/health

# Check email status
curl http://your-cloud-service/status/emails
```

### **Manual Triggers**

```bash
# Manually trigger email check
curl -X POST http://your-cloud-service/trigger-email-check
```

### **Logs and Debugging**

```bash
# Railway logs
railway logs

# Heroku logs
heroku logs --tail

# AWS CloudWatch logs
aws logs tail /aws/lambda/your-function-name
```

## 🔄 **Email Processing Flow**

### **1. Cloud Service (24/7)**

```
📧 Email arrives → Cloud service polls every 5 minutes
↓
🔍 Categorize email (support, sales, technical, urgent)
↓
📤 Send to Node-RED webhook with category and priority
↓
🏷️ Mark email as processed in Gmail
```

### **2. Node-RED (Local)**

```
📥 Receive webhook from cloud service
↓
🤖 Route to appropriate agent (support, sales, technical, escalation)
↓
📝 Generate response using templates
↓
📤 Send response back to cloud service
↓
📊 Log response and update statistics
```

## 🎯 **Agent Specializations**

### **📧 Support Agent**

- **Handles**: Customer support, help requests, issues
- **Response Time**: 24 hours
- **Escalation**: High priority → Escalation Agent
- **Templates**: Support ticket creation, acknowledgment

### **💰 Sales Agent**

- **Handles**: Quotes, pricing, demos, sales inquiries
- **Response Time**: 2 business hours
- **Actions**: Schedule demos, generate quotes
- **Templates**: Lead qualification, sales follow-up

### **🔧 Technical Agent**

- **Handles**: Technical questions, bugs, API issues
- **Response Time**: 4 hours
- **Actions**: Create bug reports, API documentation
- **Templates**: Technical support, troubleshooting

### **🚨 Escalation Agent**

- **Handles**: Urgent matters, complex cases
- **Response Time**: 1 hour
- **Actions**: Human review, team notification
- **Templates**: Urgent acknowledgment, escalation

### **📋 General Agent**

- **Handles**: Miscellaneous inquiries
- **Response Time**: 24 hours
- **Actions**: Basic acknowledgment, routing
- **Templates**: General inquiry response

## 🔒 **Security Considerations**

### **Environment Variables**

- Store all sensitive data in environment variables
- Never commit credentials to git
- Use platform-specific secret management

### **Webhook Security**

- Add authentication to webhook endpoints
- Use HTTPS for all communications
- Validate webhook payloads

### **Gmail API Security**

- Use OAuth2 with refresh tokens
- Implement proper token rotation
- Monitor API usage limits

## 📈 **Scaling Considerations**

### **High Volume**

- Implement email queuing (Redis/RabbitMQ)
- Add rate limiting to prevent API abuse
- Use multiple cloud instances for redundancy

### **Performance**

- Cache email templates and responses
- Implement connection pooling
- Monitor response times and optimize

### **Reliability**

- Add retry logic for failed operations
- Implement circuit breakers for external services
- Set up monitoring and alerting

## 🚀 **Next Steps**

1. **Choose deployment platform** (Railway recommended)
2. **Set up environment variables** with your Gmail credentials
3. **Deploy cloud service** and test health endpoints
4. **Deploy Node-RED flow** and configure webhooks
5. **Test end-to-end** with real emails
6. **Monitor and optimize** based on usage patterns

This architecture provides 24/7 email responsiveness with intelligent routing and professional responses, all while keeping your local Node-RED instance for visual management and debugging.
