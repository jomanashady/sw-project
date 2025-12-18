# 🚀 How to Start the Backend

## Quick Start

1. **Navigate to backend directory:**
   ```bash
   cd backend
   ```

2. **Install dependencies (if needed):**
   ```bash
   npm install
   ```

3. **Start the backend:**
   ```bash
   npm run start:dev
   ```

4. **Wait for startup messages:**
   You should see:
   ```
   🚀 HR System API
   ==================================================
   📍 Local: http://localhost:3001/api/v1
   🌐 Frontend: https://hr-syst.netlify.app
   ⚙️  Environment: development
   📊 Database: hr_system
   🔐 JWT: Configured ✓
   ```

5. **Test the health endpoint:**
   Open a new terminal and run:
   ```bash
   curl http://localhost:3001/api/v1/health
   ```

## Troubleshooting

### If backend won't start:

1. **Check for build errors:**
   ```bash
   npm run build
   ```
   Fix any TypeScript compilation errors

2. **Check environment variables:**
   Ensure `.env` file exists with:
   ```env
   MONGODB_URI=your-mongodb-uri
   JWT_SECRET=your-secret-key
   PORT=3001
   FRONTEND_URL=https://hr-syst.netlify.app
   ```

3. **Check if port is already in use:**
   ```powershell
   # Windows PowerShell
   netstat -ano | findstr :3001
   ```
   If something is using port 3001, either:
   - Stop that process
   - Change PORT in .env file

4. **Check MongoDB connection:**
   - Verify MONGODB_URI is correct
   - Check MongoDB Atlas network access allows your IP
   - Test MongoDB connection separately

5. **Check logs:**
   Look at the terminal output for error messages

## Common Issues

### "MONGODB_URI is not set!"
- Create `.env` file in backend directory
- Add `MONGODB_URI=your-connection-string`

### "Port 3001 already in use"
- Change PORT in `.env` to another port (e.g., 3002)
- Or stop the process using port 3001

### "Cannot connect to MongoDB"
- Check MongoDB Atlas network access
- Verify connection string is correct
- Check if MongoDB cluster is running

### Build errors
- Run `npm run build` to see detailed errors
- Fix TypeScript errors
- Ensure all dependencies are installed

## Testing After Startup

Once backend is running, test these endpoints:

1. **Health Check:**
   ```bash
   curl http://localhost:3001/api/v1/health
   ```

2. **Root Endpoint:**
   ```bash
   curl http://localhost:3001/api/v1
   ```

3. **Login Endpoint (with data):**
   ```bash
   curl -X POST http://localhost:3001/api/v1/auth/login \
     -H "Content-Type: application/json" \
     -d '{"email":"test@example.com","password":"password"}'
   ```

## For Production (Railway)

The backend will start automatically when deployed. Just ensure:
- ✅ All environment variables are set in Railway
- ✅ MongoDB URI is accessible from Railway
- ✅ Build completes successfully

