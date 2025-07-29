# 🚀 Railway Environment Variables Guide

## **Required Environment Variables for Railway Deployment**

Add these environment variables in your Railway dashboard:

### **🔑 Core API Keys**

```
OPENAI_API_KEY=your-openai-api-key-here
```

### **📧 Gmail Configuration (for email functionality)**

```
GMAIL_CLIENT_ID=your-gmail-client-id
GMAIL_CLIENT_SECRET=your-gmail-client-secret
GMAIL_USER=pragmagen@gmail.com
GMAIL_TOKEN={"access_token":"your-access-token","refresh_token":"your-refresh-token"}
```

### **🔒 Node-RED Security**

```
NODE_RED_SECRET=your-super-secret-key-here
```

### **🌐 Optional: Custom Domain (if you have one)**

```
NODE_RED_URL=https://your-custom-domain.com
```

## **📋 How to Get These Values**

### **1. OpenAI API Key**

- Go to [platform.openai.com](https://platform.openai.com)
- Create account or sign in
- Go to API Keys section
- Create new API key

### **2. Gmail OAuth Credentials**

- Go to [Google Cloud Console](https://console.cloud.google.com)
- Create new project or select existing
- Enable Gmail API
- Create OAuth 2.0 credentials
- Download credentials.json file
- Extract `client_id` and `client_secret`

### **3. Gmail Token**

- Run locally: `npm run gmail:setup`
- Follow OAuth flow
- Copy the generated token from `email_data/token.json`

### **4. Node-RED Secret**

- Generate a random string: `openssl rand -base64 32`
- Or use any secure random string

## **🔧 Railway Setup Steps**

1. **Go to Railway Dashboard**
2. **Select your project**
3. **Go to Variables tab**
4. **Add each environment variable**
5. **Redeploy** (automatic after adding variables)

## **✅ Verification**

After deployment, your Node-RED will be available at:

- **Main URL**: `https://your-app-name.railway.app`
- **Node-RED Editor**: `https://your-app-name.railway.app/red`

## **🚨 Security Notes**

- ✅ Never commit these values to git
- ✅ Use Railway's secure environment variable storage
- ✅ Rotate secrets regularly
- ✅ Monitor for unauthorized access

## **🔍 Troubleshooting**

If deployment fails:

1. Check all environment variables are set
2. Verify API keys are valid
3. Check Railway logs for specific errors
4. Ensure Gmail OAuth is properly configured

Your Node-RED system will be live and processing emails 24/7! 🎉
