# 🚀 Quick Deployment Guide - Railway

## **Fastest Way to Host Your Node-RED System**

### **Step 1: Create Railway Account**

1. Go to [railway.app](https://railway.app)
2. Sign up with GitHub (free)
3. Create a new project

### **Step 2: Deploy from GitHub**

1. Click "Deploy from GitHub repo"
2. Select your `fractal-agent-system` repository
3. Railway will automatically detect it's a Node.js app

### **Step 3: Set Environment Variables**

In Railway dashboard, add these environment variables:

```
NODE_RED_SECRET=your-super-secret-key-here
OPENAI_API_KEY=your-openai-api-key
GMAIL_CLIENT_ID=your-gmail-client-id
GMAIL_CLIENT_SECRET=your-gmail-client-secret
GMAIL_USER=pragmagen@gmail.com
GMAIL_TOKEN={"access_token":"...","refresh_token":"..."}
```

### **Step 4: Deploy**

1. Railway will automatically build and deploy
2. Your Node-RED will be available at: `https://your-app-name.railway.app`
3. Access the editor at: `https://your-app-name.railway.app/red`

## **💰 Cost Breakdown**

- **Free Tier**: 500 hours/month (good for testing)
- **Paid Tier**: $5/month for 512MB RAM, $10/month for 1GB
- **Uptime**: 99.9%+ SLA

## **🔧 What Gets Deployed**

- ✅ Node-RED server
- ✅ All your flows and configurations
- ✅ Email processing system
- ✅ AI-powered responses
- ✅ 24/7 availability

## **📧 Email System Setup**

1. Deploy your flows using the Node-RED editor
2. Import `email_triggered_flow.json` and `email_agent_team.json`
3. Configure Gmail credentials in the email nodes
4. Your email system will be live and responsive!

## **🚀 Alternative: Render**

If Railway doesn't work for you:

1. Go to [render.com](https://render.com)
2. Create new Web Service
3. Connect your GitHub repo
4. Set build command: `npm install`
5. Set start command: `npm start`
6. Cost: $7/month

## **✅ Benefits of Cloud Hosting**

- **24/7 Uptime**: Your system never sleeps
- **Automatic Scaling**: Handles traffic spikes
- **SSL/HTTPS**: Secure connections
- **Backup & Recovery**: Automatic backups
- **Monitoring**: Built-in health checks
- **Global CDN**: Fast access worldwide

## **🔍 Monitoring Your Deployment**

- Railway dashboard shows logs, metrics, and status
- Set up alerts for downtime
- Monitor resource usage
- View deployment history

## **🎯 Next Steps After Deployment**

1. Import your Node-RED flows
2. Test email functionality
3. Set up monitoring alerts
4. Configure custom domain (optional)
5. Set up automated deployments

Your Node-RED company system will be live and processing emails 24/7! 🎉
