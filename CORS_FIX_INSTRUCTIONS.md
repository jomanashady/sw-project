# 🔧 CORS Fix Instructions

## The Problem
Your frontend at `https://hr-syst.netlify.app` is being blocked by CORS when trying to access your Railway backend.

## The Solution

### Step 1: Set FRONTEND_URL in Railway
1. Go to your Railway dashboard
2. Click on your backend service
3. Go to the **Variables** tab
4. Add or update the `FRONTEND_URL` variable:
   - **Key:** `FRONTEND_URL`
   - **Value:** `https://hr-syst.netlify.app`
5. Click **Save**

### Step 2: Redeploy Backend
After setting the environment variable, Railway will automatically redeploy your backend. Wait 2-3 minutes for the deployment to complete.

### Step 3: Verify
1. Go to your Railway service → **Deployments** tab
2. Click on the latest deployment
3. Check the logs - you should see:
   ```
   🌐 CORS Allowed Origins: [...]
   🌐 Frontend URL from env: https://hr-syst.netlify.app
   ```

### Step 4: Test Frontend
1. Go to `https://hr-syst.netlify.app/auth/login`
2. Try logging in
3. Open browser console (F12)
4. You should see CORS logs like:
   ```
   ✅ CORS: Allowing Netlify domain
   ```

## What Was Fixed

1. ✅ Added explicit support for `https://hr-syst.netlify.app`
2. ✅ Fixed CORS error handling (changed from `Error` to `false`)
3. ✅ Added proper preflight request handling
4. ✅ Added logging to help debug CORS issues

## Still Not Working?

1. **Check Railway logs** - Look for CORS-related messages
2. **Verify environment variable** - Make sure `FRONTEND_URL` is set correctly in Railway
3. **Clear browser cache** - Sometimes cached CORS errors persist
4. **Check Network tab** - Look at the preflight OPTIONS request to see what headers are being sent/received

## Important Notes

- The CORS configuration now allows ALL `.netlify.app` domains automatically
- This includes preview deployments and branch deployments
- The `FRONTEND_URL` environment variable is used for logging and explicit allowlisting
- After updating Railway environment variables, the service automatically redeploys

