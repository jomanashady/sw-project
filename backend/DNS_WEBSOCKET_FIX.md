# DNS & WebSocket Troubleshooting Guide

## Important Finding: No WebSocket Implementation Found

After analyzing your codebase, **your backend does NOT use WebSockets**. Any WebSocket-related errors are likely:

1. **False positives** from browser extensions or dev tools
2. **Frontend code** trying to connect to a non-existent WebSocket
3. **Third-party scripts** or libraries attempting WebSocket connections

## DNS Resolution Issues (`net::ERR_NAME_NOT_RESOLVED`)

### Root Causes

1. **Incorrect API URL in Frontend**
   - Frontend trying to connect to wrong backend URL
   - Solution: Verify `NEXT_PUBLIC_API_URL` in Netlify

2. **Backend URL Not Accessible**
   - Railway service not deployed or down
   - Solution: Check Railway dashboard for service status

3. **MongoDB Connection Issues**
   - Backend can't resolve MongoDB hostname
   - Solution: Verify MongoDB Atlas network access

### Verification Steps

#### Step 1: Verify Backend URL
```bash
# Your backend should be accessible at:
https://hr-systemm.up.railway.app

# Test it:
curl https://hr-systemm.up.railway.app/api/v1/health
```

#### Step 2: Check Frontend Configuration
In Netlify environment variables, ensure:
```
NEXT_PUBLIC_API_URL=https://hr-systemm.up.railway.app/api/v1
```

**Important:** 
- Use `https://` not `http://`
- Include `/api/v1` at the end
- No trailing slash

#### Step 3: Verify MongoDB DNS
Your backend connects to MongoDB. If DNS fails:
- Check MongoDB Atlas → Network Access
- Ensure Railway IPs are allowed (or use 0.0.0.0/0 for development)
- Verify MongoDB URI format in Railway environment variables

## WebSocket "Errors" - What to Do

### If You See WebSocket Errors:

1. **Check Browser Console:**
   - Look for the exact WebSocket URL being attempted
   - Check if it's from your code or a third-party script

2. **Search Your Frontend Code:**
   ```bash
   # In frontend directory
   grep -r "WebSocket\|websocket\|ws:\|wss:" .
   ```

3. **If No WebSocket Code Found:**
   - These errors are likely harmless
   - May be from browser extensions
   - Can be safely ignored if backend API works

### If You Actually Need WebSockets:

1. **Install WebSocket Support:**
   ```bash
   npm install @nestjs/websockets @nestjs/platform-socket.io socket.io
   ```

2. **Configure WebSocket Gateway:**
   ```typescript
   // src/websocket/websocket.gateway.ts
   import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
   import { Server } from 'socket.io';

   @WebSocketGateway({
     cors: {
       origin: process.env.FRONTEND_URL || 'https://hr-syst.netlify.app',
       credentials: true,
     },
   })
   export class WebSocketGateway {
     @WebSocketServer()
     server: Server;
   }
   ```

3. **Update CORS to Allow WebSocket Upgrades:**
   - Already handled in `main.ts` with current CORS config

## Quick Fix Checklist

### For DNS Issues:

- [ ] **Backend URL is correct:**
  - Railway Dashboard → Service → Settings → Domains
  - Copy the exact URL (e.g., `https://hr-systemm.up.railway.app`)

- [ ] **Frontend API URL matches:**
  - Netlify → Site Settings → Environment Variables
  - `NEXT_PUBLIC_API_URL` = `https://hr-systemm.up.railway.app/api/v1`

- [ ] **Backend is running:**
  - Railway Dashboard → Service → Deployments → Latest → Logs
  - Look for: `🚀 HR System API` and `✅ CORS: Allowing origin`

- [ ] **MongoDB is accessible:**
  - MongoDB Atlas → Network Access
  - Allow Railway IPs or use 0.0.0.0/0
  - Verify `MONGODB_URI` in Railway environment variables

### For WebSocket "Errors":

- [ ] **Verify if WebSockets are actually needed:**
  - Check if your app requires real-time features
  - If not, ignore WebSocket errors

- [ ] **Check browser console:**
  - Note the exact WebSocket URL in error
  - Determine if it's from your code

- [ ] **Test API endpoints:**
  - If REST API works, WebSocket errors are likely harmless

## Testing Your Setup

### 1. Test Backend Health
```bash
curl https://hr-systemm.up.railway.app/api/v1/health
```

Expected response:
```json
{
  "status": "ok",
  "database": "connected",
  ...
}
```

### 2. Test Login Endpoint
```bash
curl -X POST https://hr-systemm.up.railway.app/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password"}'
```

### 3. Run Verification Script
```bash
cd backend
npm run verify:deployment
```

This will check:
- ✅ Environment variables
- ✅ MongoDB configuration
- ✅ CORS setup
- ✅ DNS resolution
- ✅ Backend health

## Railway-Specific DNS Issues

### Railway Domain Configuration

1. **Check Railway Domain:**
   - Railway Dashboard → Service → Settings → Domains
   - Your service gets: `your-service-name.up.railway.app`
   - This is your backend URL

2. **Custom Domain (if used):**
   - Ensure DNS records are correct
   - Verify SSL certificate is active
   - Check Railway domain status

### Railway Network Configuration

- Railway services can reach external services (MongoDB, etc.)
- No special firewall configuration needed
- Railway handles SSL/TLS automatically

## MongoDB DNS Resolution

### Common MongoDB Connection Issues

1. **MongoDB Atlas Network Access:**
   - Go to MongoDB Atlas → Network Access
   - Add IP: `0.0.0.0/0` (allows all IPs) for development
   - Or add specific Railway IPs (check Railway docs)

2. **MongoDB URI Format:**
   ```
   mongodb+srv://username:password@cluster.mongodb.net/database?retryWrites=true&w=majority
   ```

3. **Connection String in Railway:**
   - Variable: `MONGODB_URI`
   - Get from MongoDB Atlas → Connect → Drivers
   - Replace `<password>` with actual password

## Still Having Issues?

### 1. Run Full Diagnostic
```bash
cd backend
npm run verify:deployment
```

### 2. Check Railway Logs
- Railway Dashboard → Service → Deployments → Latest → Logs
- Look for error messages
- Check startup sequence

### 3. Verify Environment Variables
In Railway, ensure these are set:
- `MONGODB_URI` - MongoDB connection string
- `JWT_SECRET` - Secret for JWT tokens
- `FRONTEND_URL` - Frontend URL for CORS
- `DATABASE_NAME` - Optional, defaults to `hr_system`

### 4. Test from Different Network
- Try accessing backend from different network
- Use mobile hotspot to test
- This helps identify network-specific issues

## Summary

1. **DNS Errors:** Usually caused by incorrect URLs or unreachable services
   - Fix: Verify all URLs match between frontend and backend
   - Fix: Ensure MongoDB is accessible from Railway

2. **WebSocket Errors:** Your backend doesn't use WebSockets
   - Action: Ignore if REST API works
   - Action: Only implement if you need real-time features

3. **502 Errors:** Backend not running or misconfigured
   - Fix: Check Railway logs
   - Fix: Verify environment variables
   - Fix: Ensure MongoDB connection works

4. **CORS Errors:** Frontend URL not in allowed origins
   - Fix: Set `FRONTEND_URL` in Railway
   - Fix: Backend automatically allows `.netlify.app` domains

## Next Steps

1. ✅ Run `npm run verify:deployment` to check everything
2. ✅ Test backend health endpoint
3. ✅ Verify frontend API URL matches backend
4. ✅ Check Railway logs for any errors
5. ✅ Test login endpoint with Postman/curl

If issues persist, share:
- Output from verification script
- Railway log excerpts
- Exact error messages from browser console
- Results from API endpoint tests

