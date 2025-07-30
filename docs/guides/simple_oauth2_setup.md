# 🚀 Simple OAuth2 Setup Guide

## 🎯 **Easiest Solution: Desktop Application**

The "Desktop application" OAuth2 type doesn't require:

- ❌ Google verification
- ❌ Test users
- ❌ Redirect URI configuration
- ❌ OAuth consent screen setup

## 🔧 **Step-by-Step Setup**

### **Step 1: Create New OAuth2 Credentials**

1. Go to: https://console.cloud.google.com/
2. Select your project
3. Go to "APIs & Services" → "Credentials"
4. Click "Create Credentials" → "OAuth 2.0 Client IDs"

### **Step 2: Choose Desktop Application**

1. **Application type:** Desktop application
2. **Name:** Fractal Agent Email System
3. Click "Create"

### **Step 3: Download Credentials**

1. Download the JSON file
2. Save it as `credentials.json` in the `email_data/` folder
3. Replace any existing credentials file

### **Step 4: Run Enhanced Email System**

```bash
npm run enhanced:email
```

## ✅ **Why Desktop Application is Better**

### **Web Application (Current Issue):**

- ❌ Requires Google verification
- ❌ Needs test users added
- ❌ Requires redirect URI configuration
- ❌ More complex setup

### **Desktop Application (Recommended):**

- ✅ No verification required
- ✅ No test users needed
- ✅ No redirect URI issues
- ✅ Works immediately
- ✅ Perfect for local development

## 🔄 **Migration Steps**

### **If You Want to Keep Current Setup:**

1. Go to "OAuth consent screen"
2. Add test users: `venturevd@gmail.com`, `vandyand@gmail.com`
3. Try the authorization again

### **If You Want to Switch to Desktop App:**

1. Create new Desktop application credentials
2. Replace `credentials.json`
3. Delete any existing `token.json` file
4. Run `npm run enhanced:email`

## 🎉 **Expected Result**

After using Desktop application type:

```
✅ Gmail API authentication setup complete
✅ Email sending capability verified
✅ Email receiving capability verified: venturevd@gmail.com
```

## 🚨 **Troubleshooting**

### **Still getting verification errors?**

- Make sure you're using Desktop application type
- Check that you're signed in with the correct Google account
- Clear browser cache and try again

### **Authorization code not working?**

- Copy the entire code (no extra spaces)
- Make sure you're using the right Google account
- Try the process again

---

**🎯 Desktop application type is the easiest way to get email receiving working!**
