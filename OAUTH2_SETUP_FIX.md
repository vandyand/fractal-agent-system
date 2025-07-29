# 🔧 OAuth2 Setup Fix Guide

## ❌ Error: `redirect_uri_mismatch`

This error occurs when the redirect URI in your Google Cloud Console doesn't match what the application is using.

## 🚀 Quick Fix Options

### **Option 1: Update Google Cloud Console (Recommended)**

1. **Go to Google Cloud Console**

   - Visit: https://console.cloud.google.com/
   - Select your project

2. **Navigate to OAuth 2.0 Credentials**

   - Go to "APIs & Services" → "Credentials"
   - Find your OAuth 2.0 Client ID
   - Click on it to edit

3. **Add Redirect URIs**

   - In the "Authorized redirect URIs" section, add:
     ```
     http://localhost
     http://localhost:3000
     ```
   - Click "Save"

4. **Re-run the email system**
   ```bash
   npm run enhanced:email
   ```

### **Option 2: Create New OAuth 2.0 Credentials**

1. **Go to Google Cloud Console**

   - Visit: https://console.cloud.google.com/
   - Select your project

2. **Create New Credentials**

   - Go to "APIs & Services" → "Credentials"
   - Click "Create Credentials" → "OAuth 2.0 Client IDs"
   - Choose "Desktop application" (simpler for local development)
   - Give it a name like "Fractal Agent Email System"

3. **Download New Credentials**

   - Download the new credentials JSON file
   - Replace the existing `credentials.json` in `email_data/` folder

4. **Re-run the email system**
   ```bash
   npm run enhanced:email
   ```

## 🔍 **Why This Happens**

The OAuth2 flow works like this:

1. Application redirects user to Google with a specific `redirect_uri`
2. Google checks if this URI is in the "Authorized redirect URIs" list
3. If not found, Google blocks the request with `redirect_uri_mismatch`

## 📋 **Common Redirect URIs**

For local development, you can use:

- `http://localhost` (port 80)
- `http://localhost:3000` (port 3000)
- `http://localhost:8080` (port 8080)

For production, you'd use your actual domain:

- `https://yourdomain.com/auth/callback`

## 🎯 **Recommended Setup**

### **For Local Development:**

1. Use "Desktop application" type
2. Add multiple localhost URIs to be safe
3. This avoids redirect URI issues entirely

### **For Production:**

1. Use "Web application" type
2. Add your actual domain redirect URI
3. Remove localhost URIs for security

## ✅ **Success Indicators**

After fixing the redirect URI:

- ✅ Authorization URL works without errors
- ✅ You can grant permissions to your Gmail account
- ✅ Authorization code is generated
- ✅ Token is saved successfully
- ✅ Email system can send AND receive emails

## 🚨 **Troubleshooting**

### **Still getting redirect_uri_mismatch?**

- Double-check the URIs in Google Cloud Console
- Make sure there are no extra spaces or characters
- Try using "Desktop application" type instead of "Web application"

### **Authorization code not working?**

- Make sure you copy the entire code
- Don't include extra spaces
- Try the authorization process again

### **Token expired?**

- Delete the `token.json` file in `email_data/`
- Re-run the authorization process

---

**🎯 Once you fix the redirect URI, you'll have full email sending AND receiving capabilities!**
