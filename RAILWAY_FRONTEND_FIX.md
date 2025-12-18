# 🚨 CRITICAL: Fix Frontend Service in Railway

## The Problem
Your `hr-system-frontend` service is running the **backend** code instead of the frontend. The logs show:
```
> hr-system-backend@1.0.0 start:prod
> node dist/main
```

This means Railway is building from the **root directory** instead of the `frontend` directory.

## The Solution: Set Root Directory in Railway

### Step 1: Go to Frontend Service Settings
1. Open Railway dashboard: https://railway.com
2. Go to your project: `hr-system`
3. Click on the **`hr-system-frontend`** service (NOT the backend service)
4. Click the **"Settings"** tab (top navigation)

### Step 2: Find "Source" Section
1. Scroll down to find **"Source"** or **"Deploy"** section
2. Look for **"Root Directory"** or **"Working Directory"** field

### Step 3: Set Root Directory
1. In the **"Root Directory"** field, type: `frontend`
   - This tells Railway to build from the `frontend` folder, not the root
2. Click **"Save"** or **"Update"**

### Step 4: Redeploy
1. After saving, Railway should automatically redeploy
2. If not, go to **"Deployments"** tab
3. Click **"Redeploy"** on the latest deployment
4. Wait 3-5 minutes for the build

### Step 5: Verify
Check the **"Deploy Logs"** - you should see:
- ✅ `npm install` (installing frontend dependencies)
- ✅ `npm run build` (building Next.js app)
- ✅ `npm run start` (starting Next.js server)
- ❌ NOT `hr-system-backend@1.0.0 start:prod`
- ❌ NOT `node dist/main`

## Visual Guide

```
Railway Dashboard
├── hr-system (project)
    ├── hr-system-backend (service)
    │   └── Settings → Root Directory: (empty or "backend")
    │
    └── hr-system-frontend (service) ← FIX THIS ONE
        └── Settings → Root Directory: "frontend" ← SET THIS!
```

## If Root Directory Setting Doesn't Exist

If you don't see a "Root Directory" field:

1. **Delete the frontend service** (Settings → Danger Zone → Delete Service)
2. **Create a new service**:
   - Click "+ New" → "GitHub Repo"
   - Select your repository
   - **IMMEDIATELY** set Root Directory to: `frontend`
   - Railway will auto-detect Next.js and use Nixpacks

## After Fixing

Once Root Directory is set to `frontend`:
- Railway will use `frontend/package.json` (not `backend/package.json`)
- Railway will use `frontend/nixpacks.toml` (not root config)
- Railway will build and run the Next.js frontend (not NestJS backend)

## Environment Variables

Make sure your frontend service has:
- `NEXT_PUBLIC_API_URL` = your backend Railway URL (e.g., `https://hr-system-backend-production.up.railway.app/api/v1`)
- `NODE_ENV` = `production` (optional, but recommended)

