# 🔐 Google OAuth Production Setup Guide

## 🎯 **Setup Google OAuth for Your Live CrackZone Platform**

### **Your Production URLs:**
- **Frontend**: https://crackzone-frontend.vercel.app
- **Backend**: https://crackzone2.onrender.com
- **Admin**: https://crackzone-frontend.vercel.app/admin

---

## 📋 **Step-by-Step Setup**

### **STEP 1: Google Cloud Console Setup**

1. **Go to Google Cloud Console**
   - Visit: https://console.cloud.google.com/
   - Sign in with your Google account

2. **Create or Select Project**
   - Click "Select a project" → "New Project"
   - Project name: `CrackZone Gaming Platform`
   - Click "Create"

3. **Enable Google+ API**
   - Go to "APIs & Services" → "Library"
   - Search for "Google+ API"
   - Click "Enable"

### **STEP 2: Create OAuth Credentials**

1. **Go to Credentials**
   - Navigate to "APIs & Services" → "Credentials"
   - Click "Create Credentials" → "OAuth 2.0 Client IDs"

2. **Configure OAuth Consent Screen** (if not done)
   - Click "Configure Consent Screen"
   - Choose "External" (for public users)
   - Fill in required fields:
     - **App name**: `CrackZone Gaming Platform`
     - **User support email**: Your email
     - **Developer contact**: Your email
   - Click "Save and Continue"

3. **Create OAuth Client ID**
   - Application type: "Web application"
   - Name: `CrackZone Production`
   
   **Authorized JavaScript origins:**
   ```
   https://crackzone-frontend.vercel.app
   ```
   
   **Authorized redirect URIs:**
   ```
   https://crackzone2.onrender.com/api/auth/google/callback
   ```
   
   - Click "Create"

4. **Save Your Credentials**
   - Copy the **Client ID** (looks like: `123456789-abcdef.apps.googleusercontent.com`)
   - Copy the **Client Secret** (looks like: `GOCSPX-abcdef123456`)

### **STEP 3: Update Backend Environment Variables**

1. **Go to Render Dashboard**
   - Visit: https://render.com/dashboard
   - Click on your `crackzone2` service
   - Go to "Environment" tab

2. **Add Google OAuth Variables**
   Click "Add Environment Variable" for each:
   
   ```
   GOOGLE_CLIENT_ID = [Your Client ID from Step 2]
   GOOGLE_CLIENT_SECRET = [Your Client Secret from Step 2]
   GOOGLE_CALLBACK_URL = https://crackzone2.onrender.com/api/auth/google/callback
   ```

3. **Save Changes**
   - Click "Save Changes"
   - Wait for automatic redeploy (2-3 minutes)

### **STEP 4: Update Frontend Environment Variables**

1. **Go to Vercel Dashboard**
   - Visit: https://vercel.com/dashboard
   - Click on your `crackzone-frontend` project
   - Go to "Settings" → "Environment Variables"

2. **Add Google Client ID**
   ```
   Variable Name: VITE_GOOGLE_CLIENT_ID
   Value: [Your Client ID from Step 2]
   Environment: Production
   ```

3. **Redeploy Frontend**
   - Go to "Deployments" tab
   - Click "..." on latest deployment → "Redeploy"

### **STEP 5: Test Google OAuth**

1. **Visit Your Website**
   - Go to: https://crackzone-frontend.vercel.app
   - Click "Login" or "Sign Up"

2. **Test Google Login**
   - Click "Continue with Google" button
   - Should redirect to Google OAuth consent screen
   - Authorize the app
   - Should redirect back to your platform

---

## 🧪 **Testing Checklist**

### ✅ **Test These Flows:**

1. **New User Google Signup**
   - Click "Continue with Google"
   - Complete Google authorization
   - Should create new account
   - Complete profile setup

2. **Existing User Google Login**
   - Users with Google accounts should login seamlessly
   - Profile data should be imported

3. **Error Handling**
   - Test with denied permissions
   - Test with invalid credentials

---

## 🔧 **Configuration Summary**

### **Google Cloud Console Settings:**
- **Project**: CrackZone Gaming Platform
- **OAuth Client Type**: Web application
- **Authorized Origins**: `https://crackzone-frontend.vercel.app`
- **Redirect URI**: `https://crackzone2.onrender.com/api/auth/google/callback`

### **Backend Environment Variables (Render):**
```
GOOGLE_CLIENT_ID = [Your Client ID]
GOOGLE_CLIENT_SECRET = [Your Client Secret]
GOOGLE_CALLBACK_URL = https://crackzone2.onrender.com/api/auth/google/callback
```

### **Frontend Environment Variables (Vercel):**
```
VITE_GOOGLE_CLIENT_ID = [Your Client ID]
```

---

## 🚨 **Troubleshooting**

### **Common Issues:**

1. **"OAuth Error: redirect_uri_mismatch"**
   - Check redirect URI in Google Console matches exactly
   - Should be: `https://crackzone2.onrender.com/api/auth/google/callback`

2. **"OAuth Error: unauthorized_client"**
   - Check authorized origins in Google Console
   - Should be: `https://crackzone-frontend.vercel.app`

3. **"Google OAuth not configured"**
   - Check environment variables are set in Render
   - Redeploy backend after adding variables

4. **Google button not appearing**
   - Check frontend environment variable is set in Vercel
   - Redeploy frontend after adding variable

### **Debug Steps:**
1. Check browser console for errors
2. Check Render logs for backend errors
3. Verify all URLs match exactly (no trailing slashes)
4. Test in incognito mode

---

## 🎉 **Success Indicators**

When working correctly, you should see:
- ✅ "Continue with Google" button on login/signup pages
- ✅ Smooth redirect to Google OAuth
- ✅ Successful authorization and redirect back
- ✅ User account created/logged in
- ✅ Profile data imported from Google

---

## 📞 **Need Help?**

If you encounter issues:
1. Check the troubleshooting section above
2. Verify all URLs and credentials are correct
3. Test in different browsers
4. Check both Render and Vercel logs

**Your CrackZone platform will have professional Google OAuth integration once this is complete!** 🚀