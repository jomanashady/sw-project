# Netlify Deployment Guide

## Quick Setup

### 1. Connect Repository to Netlify

1. Go to [Netlify Dashboard](https://app.netlify.com)
2. Click **"Add new site"** → **"Import an existing project"**
3. Connect your GitHub repository
4. Select your repository: `sw-project` (or your repo name)

### 2. Configure Build Settings

**IMPORTANT:** Set these in Netlify:

- **Base directory:** `frontend`
- **Build command:** `npm run build` (or leave empty - Netlify will auto-detect)
- **Publish directory:** `.next` (or leave empty - Next.js plugin handles this)

### 3. Set Environment Variables

Go to **Site settings** → **Environment variables** and add:

```
NEXT_PUBLIC_API_URL = https://your-backend-url.railway.app/api/v1
```

**Replace `your-backend-url.railway.app` with your actual Railway backend URL.**

Example:
```
NEXT_PUBLIC_API_URL = https://hr-system-backend-production.up.railway.app/api/v1
```

### 4. Deploy

1. Click **"Deploy site"**
2. Wait for the build to complete (3-5 minutes)
3. Your site will be live at `https://your-site-name.netlify.app`

## Configuration Files

The following files are already configured:

- ✅ `netlify.toml` (root) - Points to `frontend` directory
- ✅ `frontend/netlify.toml` - Next.js plugin configuration
- ✅ `frontend/next.config.js` - Next.js configuration
- ✅ `frontend/lib/api/client.ts` - Uses `NEXT_PUBLIC_API_URL` environment variable

## Troubleshooting

### "Page not found" errors

- Make sure **Base directory** is set to `frontend` in Netlify
- Make sure `@netlify/plugin-nextjs` is installed (it's auto-installed by Netlify)
- Check that `NEXT_PUBLIC_API_URL` is set correctly

### API connection errors

- Verify `NEXT_PUBLIC_API_URL` is set in Netlify environment variables
- Make sure your backend (Railway) is running and accessible
- Check CORS settings in your backend to allow your Netlify domain

### Build failures

- Check build logs in Netlify dashboard
- Make sure Node.js version is 20 (set in `netlify.toml`)
- Verify all dependencies are in `package.json`

## After Deployment

1. **Test your site:** Visit your Netlify URL
2. **Check API connection:** Open browser console and verify API calls are working
3. **Update backend CORS:** Make sure your Railway backend allows your Netlify domain

## Environment Variables Reference

| Variable | Description | Example |
|----------|-------------|---------|
| `NEXT_PUBLIC_API_URL` | Backend API URL | `https://hr-system-backend.up.railway.app/api/v1` |

**Note:** All `NEXT_PUBLIC_*` variables are exposed to the browser, so make sure they don't contain secrets.

