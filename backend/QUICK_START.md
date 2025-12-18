# 🚀 Quick Start - Backend Server

## Current Status
- ✅ Configuration verified
- ✅ Environment variables set
- ❌ Backend server not running

## To Start the Backend:

### Option 1: Start in Development Mode (Recommended)
```bash
npm run start:dev
```

This will:
- Compile TypeScript
- Watch for file changes
- Start server on port 5000 (from your .env)

### Option 2: Start in Production Mode
```bash
npm run build
npm run start:prod
```

## After Starting:

1. **Wait for this message:**
   ```
   🚀 HR System API
   📍 Local: http://localhost:5000/api/v1
   ```

2. **Test the health endpoint:**
   ```bash
   curl http://localhost:5000/api/v1/health
   ```

3. **Expected response:**
   ```json
   {
     "status": "ok",
     "timestamp": "2024-...",
     "uptime": 123.45,
     "database": "connected",
     "memory": {
       "used": 50,
       "total": 256
     }
   }
   ```

## Troubleshooting

### If port 5000 is already in use:
Change PORT in `.env` file:
```env
PORT=3001
```

### If you see MongoDB connection errors:
- Check `MONGODB_URI` in `.env`
- Verify MongoDB Atlas network access
- Ensure MongoDB cluster is running

### If compilation fails:
- Run `npm run build` to see detailed errors
- Fix TypeScript errors
- Ensure all dependencies installed: `npm install`

## Keep the Server Running

- **Don't close the terminal** where the server is running
- Use `Ctrl+C` to stop the server
- The server must be running for API requests to work

