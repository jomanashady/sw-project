# 🔧 Fixing 502 Bad Gateway Error

## Problem
The OPTIONS preflight request is getting a **502 Bad Gateway** error. This means:
- ✅ Request reaches Railway's edge proxy
- ❌ Railway can't forward the request to your backend service
- ❌ Backend service may be crashed, not responding, or timing out

## This is NOT a CORS Issue
- 502 = Server/routing problem
- CORS errors = Browser blocking (would show CORS policy error, not 502)

## Diagnosis Steps

### 1. Check Railway Service Status

Go to Railway Dashboard → Your Service → **Observability** tab:
- Check if service is actually running
- Look for CPU/Memory usage
- Check for crash loops or restarts

### 2. Check Railway Logs

Go to Railway Dashboard → Your Service → **Logs** tab:
- Look for error messages
- Check if backend started successfully
- Look for MongoDB connection errors
- Check for unhandled exceptions

**What to look for:**
```
❌ Error starting application: ...
❌ Unhandled Rejection: ...
❌ MONGODB_URI is not set!
❌ Database connection failed
```

### 3. Test Backend Health Endpoint

Try accessing the health endpoint directly:
```bash
curl https://hr-systemm.up.railway.app/api/v1/health
```

**If this also returns 502:**
- Backend service is down or crashed
- Need to check Railway logs for errors

**If this works but OPTIONS doesn't:**
- CORS middleware might be crashing on OPTIONS
- Check for errors in OPTIONS handling

## Common Causes & Fixes

### Cause 1: Backend Service Crashed

**Symptoms:**
- Service shows "Active" but requests fail
- Logs show startup then crash
- 502 on all endpoints

**Fix:**
1. Check Railway logs for crash reason
2. Common causes:
   - Missing environment variables (MONGODB_URI, JWT_SECRET)
   - MongoDB connection timeout
   - Unhandled exception during startup
   - Memory limit exceeded

### Cause 2: MongoDB Connection Failing

**Symptoms:**
- Backend starts but crashes when connecting to MongoDB
- Logs show MongoDB connection errors
- Service restarts repeatedly

**Fix:**
1. Verify `MONGODB_URI` in Railway environment variables
2. Check MongoDB Atlas network access:
   - Go to MongoDB Atlas → Network Access
   - Ensure Railway IPs are allowed (or use 0.0.0.0/0 for development)
3. Verify MongoDB cluster is running
4. Check connection string format

### Cause 3: Service Not Listening on Correct Port

**Symptoms:**
- Backend starts but Railway can't connect
- Logs show backend listening on wrong port

**Fix:**
- Railway automatically sets `PORT` environment variable
- Backend should use: `process.env.PORT || 3001`
- Don't hardcode ports in Railway

### Cause 4: Startup Timeout

**Symptoms:**
- Backend takes too long to start
- Railway times out waiting for service

**Fix:**
1. Check startup time in logs
2. Optimize startup:
   - Reduce MongoDB connection timeout
   - Move heavy initialization to background
   - Check for blocking operations

### Cause 5: CORS Middleware Crashing on OPTIONS

**Symptoms:**
- Regular requests work
- OPTIONS requests return 502
- Logs show errors when OPTIONS request arrives

**Fix:**
1. Check CORS middleware for errors
2. Ensure OPTIONS handling doesn't throw exceptions
3. Verify cors package is properly configured

## Immediate Actions

### Step 1: Check Railway Logs
```
Railway Dashboard → Service → Logs → Deploy Logs
```

Look for:
- ❌ Error messages
- ❌ Stack traces
- ❌ Connection failures
- ❌ Missing environment variables

### Step 2: Restart Service
```
Railway Dashboard → Service → Settings → Restart Service
```

### Step 3: Verify Environment Variables
```
Railway Dashboard → Service → Variables
```

Required:
- `MONGODB_URI` - MongoDB connection string
- `JWT_SECRET` - Secret for JWT tokens
- `FRONTEND_URL` - `https://hr-syst.netlify.app`
- `PORT` - Set automatically by Railway (don't set manually)

### Step 4: Test Health Endpoint
```bash
curl https://hr-systemm.up.railway.app/api/v1/health
```

Expected: JSON response with status "ok"

If 502: Service is down - check logs
If 200: Service is up - CORS might be the issue

## Debugging CORS on Railway

If health endpoint works but OPTIONS returns 502:

1. **Check CORS middleware logs:**
   Look for: `✅ Express CORS: Allowing origin: ...`
   If missing, CORS middleware might not be running

2. **Verify CORS is first middleware:**
   In `main.ts`, CORS must be configured BEFORE any other middleware

3. **Test OPTIONS manually:**
   ```bash
   curl -X OPTIONS https://hr-systemm.up.railway.app/api/v1/auth/login \
     -H "Origin: https://hr-syst.netlify.app" \
     -H "Access-Control-Request-Method: POST" \
     -H "Access-Control-Request-Headers: content-type" \
     -v
   ```

## Quick Fix Checklist

- [ ] Check Railway logs for errors
- [ ] Verify all environment variables are set
- [ ] Test health endpoint: `curl https://hr-systemm.up.railway.app/api/v1/health`
- [ ] Restart Railway service
- [ ] Check MongoDB connection
- [ ] Verify service is actually running (not just "Active")
- [ ] Check for crash loops in Railway observability
- [ ] Verify PORT is not hardcoded
- [ ] Test OPTIONS request manually

## If Still Not Working

1. **Check Railway Service Health:**
   - Go to Observability tab
   - Check CPU/Memory usage
   - Look for resource limits

2. **Review Recent Deployments:**
   - Check if recent code changes broke something
   - Rollback to last working deployment if needed

3. **Test Locally:**
   - Run backend locally: `npm run start:dev`
   - Test OPTIONS request locally
   - If works locally but not on Railway, it's a deployment issue

4. **Check Railway Status:**
   - Visit Railway status page
   - Check for known issues

## Expected Behavior

**Working Backend:**
- Health endpoint: `200 OK` with JSON response
- OPTIONS request: `204 No Content` with CORS headers
- POST request: `200 OK` or appropriate status code

**Current Issue:**
- OPTIONS request: `502 Bad Gateway` ❌
- This means backend service is not responding

## Next Steps

1. ✅ Check Railway logs immediately
2. ✅ Verify service is running (not just "Active")
3. ✅ Test health endpoint
4. ✅ Restart service if needed
5. ✅ Check MongoDB connection
6. ✅ Verify environment variables

The 502 error indicates the backend service itself is not responding, not a CORS configuration issue.

