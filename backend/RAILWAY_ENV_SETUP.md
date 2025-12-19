# 🚂 Railway Environment Variables Setup

## Required Environment Variables

Set these in Railway Dashboard → Your Service → Variables:

### Critical (Required)
```
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/database
JWT_SECRET=your-secret-key-here
FRONTEND_URL=https://hr-syst.netlify.app
```

### Recommended
```
NODE_ENV=production
DATABASE_NAME=hr_system
JWT_EXPIRATION=24h
```

## How to Set in Railway

1. Go to Railway Dashboard
2. Click on your `hr-system-backend` service
3. Click on **Variables** tab
4. Click **+ New Variable** for each variable
5. Enter the **Key** and **Value**
6. Click **Save**

**Important:** After adding/updating variables, Railway will automatically redeploy your service.

## NODE_ENV Issue

Your logs show `Environment: development` even though you're in production.

**Fix:**
1. Add `NODE_ENV=production` in Railway Variables
2. This ensures:
   - Proper error handling
   - Optimized performance
   - Correct logging levels

## Verification

After setting variables, check the deploy logs. You should see:
```
🌐 Frontend URL from env: https://hr-syst.netlify.app
⚙️  Environment: production
🔐 JWT: Configured ✓
✅ Server started successfully and listening for requests
```

## Common Issues

### Service Keeps Restarting
- Check if `MONGODB_URI` is correct
- Verify MongoDB Atlas network access allows Railway IPs
- Check logs for connection errors

### 502 Bad Gateway
- Service might be crashing after startup
- Check logs for unhandled exceptions
- Verify all required environment variables are set

### CORS Errors
- Ensure `FRONTEND_URL` matches your Netlify URL exactly
- Check that CORS logs show: `✅ Express CORS: Allowing origin: ...`

