# 🚨 Quick Fix for Netlify Deployment

## The Problem
Your frontend is trying to connect to `localhost:6000` because the `NEXT_PUBLIC_API_URL` environment variable is not set in Netlify.

## The Solution

### Step 1: Get Your Railway Backend URL
1. Go to your Railway dashboard
2. Click on your backend service
3. Copy the URL (it will look like: `https://your-app-name.up.railway.app`)
4. Add `/api/v1` to the end: `https://your-app-name.up.railway.app/api/v1`

### Step 2: Set Environment Variable in Netlify
1. Go to your Netlify dashboard
2. Click on your site (the one deployed at `hr-syst.netlify.app`)
3. Go to **Site settings** (gear icon in the top right)
4. Click **Environment variables** in the left sidebar
5. Click **Add variable**
6. Set:
   - **Key:** `NEXT_PUBLIC_API_URL`
   - **Value:** `https://your-railway-backend-url.up.railway.app/api/v1`
   - Replace `your-railway-backend-url` with your actual Railway URL
7. Click **Save**

### Step 3: Redeploy
1. After saving the environment variable, Netlify will automatically trigger a new deployment
2. Wait 2-3 minutes for the build to complete
3. Refresh your site at `https://hr-syst.netlify.app`

### Step 4: Verify
1. Open your site
2. Open browser console (F12)
3. You should see: `✅ NEXT_PUBLIC_API_URL is set correctly`
4. The login should now work!

## Example
If your Railway backend URL is: `https://hr-system-backend.up.railway.app`

Then set `NEXT_PUBLIC_API_URL` to: `https://hr-system-backend.up.railway.app/api/v1`

## Important Notes
- Make sure to include `/api/v1` at the end of the URL
- The environment variable name must be exactly: `NEXT_PUBLIC_API_URL` (case-sensitive)
- After setting the variable, Netlify will automatically redeploy
- The changes take effect after the new deployment completes

## Still Not Working?
1. Check that your Railway backend is running (visit the Railway URL directly)
2. Verify the environment variable is set correctly in Netlify
3. Check the Netlify build logs for any errors
4. Make sure your Railway backend has `FRONTEND_URL` set to `https://hr-syst.netlify.app`

