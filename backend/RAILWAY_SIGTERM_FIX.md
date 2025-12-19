# 🔧 Fixing Railway SIGTERM Issue

## Problem
Railway is sending `SIGTERM` immediately after the server starts, killing the container. This happens because Railway's health check is failing.

## Root Cause
Railway performs health checks to verify your service is running. If:
- The health check doesn't get a response quickly enough
- The health check endpoint doesn't exist or returns an error
- The server takes too long to become ready

Railway will kill the container with SIGTERM.

## Fixes Applied

### 1. Added `/api/v1/ready` Endpoint
- Simple endpoint that responds immediately
- No database checks or heavy operations
- Perfect for Railway health checks

### 2. Updated `railway.json`
- Added `healthcheckPath: "/api/v1/ready"`
- Added `healthcheckTimeout: 100` (100ms timeout)
- Tells Railway which endpoint to check

### 3. Improved Logging
- Server logs "READY" message immediately after `listen()`
- Confirms server is accepting connections
- Helps debug timing issues

## What to Do

### Step 1: Deploy the Fixes
```bash
git add .
git commit -m "Fix Railway health check - add /ready endpoint"
git push
```

### Step 2: Monitor Railway Logs
After deployment, you should see:
```
✅ Server started successfully and listening for requests
✅ Server is READY - Railway can now health check
```

**And Railway should NOT send SIGTERM immediately.**

### Step 3: Verify Service Stays Running
- Check Railway Dashboard → Service → Observability
- Service should show as "Online" and stay running
- No more immediate SIGTERM signals

## Railway Health Check Behavior

Railway automatically:
1. Waits for your service to start
2. Makes HTTP requests to verify it's healthy
3. If health check fails → sends SIGTERM
4. If health check passes → service stays running

**By default, Railway checks:**
- Root endpoint: `/`
- Or the endpoint specified in `healthcheckPath`

## Testing

### Test Readiness Endpoint Locally
```bash
curl http://localhost:5000/api/v1/ready
```

**Expected:**
```json
{
  "status": "ready",
  "timestamp": "2024-..."
}
```

### Test on Railway
```bash
curl https://hr-systemm.up.railway.app/api/v1/ready
```

**Expected:** Same JSON response

## If SIGTERM Still Happens

### 1. Check Railway Logs
Look for:
- How long between "Server started" and "SIGTERM received"
- Any errors before SIGTERM
- Health check timeout messages

### 2. Verify Health Check Endpoint
```bash
# Test immediately after deployment
curl https://hr-systemm.up.railway.app/api/v1/ready
```

If this returns 502 or times out, Railway will kill the service.

### 3. Check Startup Time
If your server takes too long to start:
- Railway might timeout the health check
- Optimize startup: reduce MongoDB connection timeout
- Move heavy initialization to background

### 4. Verify railway.json
Ensure `railway.json` is in the **root** of your repository (not in backend/):
```
sw-project-2/
  ├── railway.json  ← Should be here
  ├── backend/
  └── frontend/
```

## Alternative: Railway Settings

If `railway.json` doesn't work, configure in Railway Dashboard:
1. Railway Dashboard → Service → Settings
2. Look for "Health Check" or "Healthcheck" settings
3. Set health check path: `/api/v1/ready`
4. Set timeout: 100ms (or higher if needed)

## Summary

**Before:**
- Server starts → Railway checks health → Health check fails → SIGTERM ❌

**After:**
- Server starts → `/ready` endpoint available → Railway checks → Health check passes → Service stays running ✅

The `/ready` endpoint ensures Railway can quickly verify your service is healthy without waiting for database connections or heavy operations.

