# 🔧 Backend Troubleshooting Guide

## Quick Diagnosis

Run the verification script to check your deployment:
```bash
npm run verify:deployment
```

## Common Issues & Solutions

### 1. DNS Resolution Errors (`net::ERR_NAME_NOT_RESOLVED`)

**Symptoms:**
- Browser console shows `net::ERR_NAME_NOT_RESOLVED`
- API requests fail with DNS errors
- Backend cannot connect to external services

**Causes & Solutions:**

#### A. Backend URL Not Resolvable
- **Check:** Verify your Railway backend URL is correct
- **Solution:** 
  - Go to Railway Dashboard → Your Service → Settings → Domains
  - Ensure you're using the correct Railway-provided domain
  - Format: `https://your-service-name.up.railway.app`

#### B. Frontend API URL Misconfigured
- **Check:** Verify `NEXT_PUBLIC_API_URL` in Netlify environment variables
- **Solution:**
  - Go to Netlify → Site Settings → Environment Variables
  - Set `NEXT_PUBLIC_API_URL` to: `https://your-railway-backend.up.railway.app/api/v1`
  - **Important:** Include `/api/v1` at the end
  - Redeploy frontend after changes

#### C. MongoDB Connection Issues
- **Check:** Verify `MONGODB_URI` in Railway environment variables
- **Solution:**
  - Ensure MongoDB Atlas allows connections from Railway IPs (or use 0.0.0.0/0 for development)
  - Check MongoDB URI format: `mongodb+srv://username:password@cluster.mongodb.net/database`
  - Verify network access in MongoDB Atlas → Network Access

### 2. CORS Errors

**Symptoms:**
- Browser console shows CORS policy errors
- Preflight OPTIONS requests fail
- `Access-Control-Allow-Origin` header missing

**Solutions:**

1. **Verify CORS Configuration:**
   - Check Railway logs for CORS messages
   - Look for: `✅ Express CORS: Allowing origin: ...`
   - Ensure `FRONTEND_URL` is set in Railway: `https://hr-syst.netlify.app`

2. **Check Allowed Origins:**
   - Backend automatically allows all `.netlify.app` domains
   - Verify your frontend URL matches: `https://hr-syst.netlify.app`

3. **Clear Browser Cache:**
   - Hard refresh: `Ctrl+Shift+R` (Windows) or `Cmd+Shift+R` (Mac)
   - Or clear browser cache completely

### 3. 502 Bad Gateway Errors

**Symptoms:**
- API returns 502 errors
- Backend appears down
- Service unavailable errors

**Causes & Solutions:**

#### A. Backend Service Not Running
- **Check Railway Logs:**
  - Go to Railway Dashboard → Your Service → Deployments → Latest → Logs
  - Look for startup errors or crashes
  - Check if service is actually running

- **Common Causes:**
  - Missing environment variables (MONGODB_URI, JWT_SECRET)
  - Database connection failures
  - Port configuration issues
  - Build errors

#### B. Resource Limits
- **Check Railway Observability:**
  - Go to Railway Dashboard → Your Service → Observability
  - Check CPU/Memory usage
  - Look for resource limit warnings
  - Upgrade plan if needed

#### C. Database Connection Timeout
- **Symptoms:** Backend starts but can't connect to MongoDB
- **Solutions:**
  - Verify MongoDB URI is correct
  - Check MongoDB Atlas network access
  - Increase timeout in `app.module.ts` if needed
  - Verify database credentials

### 4. WebSocket Errors (If Applicable)

**Note:** This backend does NOT currently use WebSockets. If you see WebSocket errors:

1. **Check Frontend Code:**
   - Search for WebSocket connections in frontend
   - Remove or disable WebSocket code if not needed
   - These errors might be from browser extensions or other sources

2. **If You Need WebSockets:**
   - Install `@nestjs/websockets` package
   - Configure WebSocket gateway
   - Update CORS to allow WebSocket connections
   - Configure Railway to support WebSocket upgrades

### 5. Environment Variable Issues

**Required Variables in Railway:**
```bash
MONGODB_URI=mongodb+srv://...
JWT_SECRET=your-secret-key
PORT=3001  # Railway sets this automatically
FRONTEND_URL=https://hr-syst.netlify.app
DATABASE_NAME=hr_system  # Optional, defaults to hr_system
```

**How to Set:**
1. Railway Dashboard → Your Service → Variables
2. Add each variable
3. Save (triggers automatic redeploy)
4. Wait 2-3 minutes for deployment

### 6. API Endpoint Testing

**Test Backend Health:**
```bash
# Using curl
curl https://your-railway-backend.up.railway.app/api/v1/health

# Using Postman
GET https://your-railway-backend.up.railway.app/api/v1/health
```

**Expected Response:**
```json
{
  "status": "ok",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "uptime": 123.45,
  "database": "connected",
  "memory": {
    "used": 50,
    "total": 256
  }
}
```

**Test Login Endpoint:**
```bash
curl -X POST https://your-railway-backend.up.railway.app/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password"}'
```

### 7. Railway-Specific Issues

#### A. Service Not Deploying
- Check Railway build logs for errors
- Verify `package.json` has correct build script
- Ensure Dockerfile or nixpacks.toml is correct
- Check for build timeout issues

#### B. Port Configuration
- Railway automatically sets `PORT` environment variable
- Backend uses `process.env.PORT || 3001`
- Don't hardcode ports in Railway

#### C. Build Failures
- Check build logs in Railway
- Common issues:
  - Missing dependencies
  - TypeScript compilation errors
  - Environment variable issues during build
  - Memory limits during build

### 8. Network & Connectivity

#### Check External Service Connectivity:
```bash
# Test MongoDB connectivity (from Railway logs)
# Backend will log connection status on startup

# Test DNS resolution
nslookup mongodb.net
nslookup railway.app
```

#### Firewall Issues:
- Railway services can reach external services
- MongoDB Atlas must allow Railway IPs (or 0.0.0.0/0)
- No firewall configuration needed on Railway side

## Diagnostic Commands

### Local Testing
```bash
# Start backend locally
npm run start:dev

# Run verification script
npm run verify:deployment

# Check environment variables
echo $MONGODB_URI
echo $JWT_SECRET
```

### Railway Logs
```bash
# View logs in Railway Dashboard:
# Service → Deployments → Latest → Logs

# Look for:
# - ✅ Startup success messages
# - ❌ Error messages
# - 🌐 CORS logs
# - 🗄️ Database connection logs
```

## Quick Checklist

Before reporting issues, verify:

- [ ] All required environment variables are set in Railway
- [ ] MongoDB URI is correct and accessible
- [ ] Backend service is running (check Railway logs)
- [ ] Health endpoint responds: `/api/v1/health`
- [ ] CORS is configured correctly (`FRONTEND_URL` set)
- [ ] Frontend `NEXT_PUBLIC_API_URL` matches backend URL
- [ ] No build errors in Railway deployment logs
- [ ] Database connection is successful
- [ ] JWT_SECRET is set and not empty

## Getting Help

1. **Run Verification Script:**
   ```bash
   npm run verify:deployment
   ```

2. **Check Railway Logs:**
   - Copy relevant error messages
   - Note timestamps of errors

3. **Test API Endpoints:**
   - Use Postman or curl to test endpoints
   - Share request/response details

4. **Environment Check:**
   - List all Railway environment variables (hide secrets)
   - Verify MongoDB connection string format

## Common Error Messages

| Error | Cause | Solution |
|-------|-------|----------|
| `net::ERR_NAME_NOT_RESOLVED` | DNS/URL issue | Check API URL configuration |
| `CORS policy blocked` | CORS misconfiguration | Set `FRONTEND_URL` in Railway |
| `502 Bad Gateway` | Backend down | Check Railway logs and service status |
| `MONGODB_URI is not set` | Missing env var | Add `MONGODB_URI` in Railway |
| `JWT_SECRET not set` | Missing env var | Add `JWT_SECRET` in Railway |
| `Connection timeout` | Database unreachable | Check MongoDB network access |

## Next Steps After Fixing

1. ✅ Verify backend health endpoint works
2. ✅ Test login endpoint with Postman/curl
3. ✅ Check Railway logs for any warnings
4. ✅ Test frontend connection
5. ✅ Monitor for 24 hours to ensure stability

