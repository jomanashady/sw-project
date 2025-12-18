# 🚀 Deployment Checklist - Fix CORS Issue

## ⚠️ Important: You Must Push Code to GitHub

The CORS fix is in your local code, but **Railway won't see it until you push to GitHub**.

## Step 1: Commit and Push Your Changes

```bash
# Make sure you're in the project root
cd C:\Users\jomana\sw-project-2

# Check what files changed
git status

# Add all changes
git add .

# Commit the changes
git commit -m "Fix CORS configuration for Netlify deployment"

# Push to GitHub
git push origin main
```

## Step 2: Wait for Railway to Deploy

1. Go to Railway dashboard
2. You should see a new deployment starting automatically
3. Wait 2-3 minutes for the build to complete
4. Check the deployment logs

## Step 3: Verify CORS is Working

### Check Railway Logs
1. Go to Railway → Your Service → Deployments
2. Click on the latest deployment
3. Click "View Logs"
4. Look for these messages:
   ```
   🌐 CORS Configuration:
      Frontend URL from env: https://hr-syst.netlify.app
      Allowed origins: [...]
   ```

### Test the Backend Directly
1. Open a new browser tab
2. Go to: `https://hr-systemm.up.railway.app/api/v1/health`
3. You should see a JSON response (this confirms the backend is running)

### Test CORS with Browser Console
1. Go to `https://hr-syst.netlify.app/auth/login`
2. Open browser console (F12)
3. Try to login
4. Check the console for CORS logs:
   - You should see: `🔍 CORS: Checking origin: https://hr-syst.netlify.app`
   - Then: `✅ CORS: Allowing Netlify domain`

## Step 4: Verify Environment Variables in Railway

Make sure these are set in Railway:

1. **FRONTEND_URL** = `https://hr-syst.netlify.app`
2. **MONGODB_URI** = (your MongoDB connection string)
3. **JWT_SECRET** = (your secret key)
4. **NODE_ENV** = `production`
5. **DATABASE_NAME** = `hr_system`

## Troubleshooting

### If CORS still doesn't work after deployment:

1. **Check Railway Logs**
   - Look for CORS-related console logs
   - If you don't see any CORS logs, the code might not have deployed

2. **Verify the Code Was Deployed**
   - Check Railway → Deployments → Latest deployment
   - Look at the build logs to see if it built successfully
   - Check the commit hash matches your latest commit

3. **Test Backend Directly**
   - Use Postman or curl to test the backend
   - Try: `curl -X OPTIONS https://hr-systemm.up.railway.app/api/v1/auth/login -H "Origin: https://hr-syst.netlify.app" -v`
   - You should see `Access-Control-Allow-Origin` header in the response

4. **Clear Browser Cache**
   - Sometimes cached CORS errors persist
   - Try incognito/private browsing mode

5. **Check Network Tab**
   - Open browser DevTools → Network tab
   - Try to login
   - Look at the OPTIONS request (preflight)
   - Check the response headers - should include `Access-Control-Allow-Origin`

## Quick Test Command

You can test CORS from command line:

```bash
curl -X OPTIONS https://hr-systemm.up.railway.app/api/v1/auth/login \
  -H "Origin: https://hr-syst.netlify.app" \
  -H "Access-Control-Request-Method: POST" \
  -H "Access-Control-Request-Headers: Content-Type,Authorization" \
  -v
```

You should see `Access-Control-Allow-Origin: https://hr-syst.netlify.app` in the response headers.

