# 🚀 Deployment Guide - Railway (Backend) + Netlify (Frontend)

This guide will help you deploy your HR Management System:
- **Backend** → Railway
- **Frontend** → Netlify

## 📋 Prerequisites

1. ✅ Your code pushed to a GitHub repository
2. ✅ A GitHub account
3. ✅ MongoDB Atlas account (free tier available)
4. ✅ Railway account (free tier available)
5. ✅ Netlify account (free tier available)

---

## Step 1: Set Up MongoDB Atlas (Free Database)

### 1.1 Create MongoDB Atlas Account
1. Go to [https://www.mongodb.com/cloud/atlas/register](https://www.mongodb.com/cloud/atlas/register)
2. Sign up with your email (it's free!)
3. Choose the **FREE** tier (M0 Sandbox)

### 1.2 Create a Cluster
1. After signing up, click **"Build a Database"**
2. Select **"M0 FREE"** tier
3. Choose a cloud provider (AWS, Google Cloud, or Azure)
4. Select a region closest to you
5. Name your cluster (e.g., "hr-system-cluster")
6. Click **"Create"** (takes 3-5 minutes)

### 1.3 Set Up Database Access
1. Go to **"Database Access"** in the left sidebar
2. Click **"Add New Database User"**
3. Choose **"Password"** authentication
4. Create a username and password (save these!)
5. Set user privileges to **"Atlas admin"** (for free tier)
6. Click **"Add User"**

### 1.4 Configure Network Access
1. Go to **"Network Access"** in the left sidebar
2. Click **"Add IP Address"**
3. Click **"Allow Access from Anywhere"** (for development)
   - Or add specific IPs for production
4. Click **"Confirm"**

### 1.5 Get Your Connection String
1. Go to **"Database"** → Click **"Connect"** on your cluster
2. Choose **"Connect your application"**
3. Copy the connection string (looks like: `mongodb+srv://username:password@cluster.mongodb.net/`)
4. Replace `<password>` with your database user password
5. Replace `<dbname>` with `hr_system` (or your preferred database name)
6. **Save this connection string** - you'll need it later!

**Example connection string:**
```
mongodb+srv://myuser:mypassword@cluster0.xxxxx.mongodb.net/hr_system?retryWrites=true&w=majority
```

---

## Step 2: Deploy Backend to Railway

### 2.1 Create Railway Account
1. Go to [https://railway.app](https://railway.app)
2. Click **"Start a New Project"**
3. Sign up with your GitHub account (recommended for auto-deploy)

### 2.2 Create a New Project
1. In your Railway dashboard, click **"New Project"**
2. Select **"Deploy from GitHub repo"**
3. Authorize Railway to access your GitHub if prompted
4. Select your repository (`sw-project-2`)

### 2.3 Configure the Service
Railway will auto-detect the `nixpacks.toml` configuration. The backend is configured to:
- Use Node.js 20
- Install dependencies from `backend/` directory
- Build the NestJS application
- Start with `npm run start:prod`

**Important:** Railway will automatically:
- Use the `nixpacks.toml` in the root directory
- Build from the `backend/` directory (as configured in nixpacks.toml)
- Set the `PORT` environment variable automatically

### 2.4 Set Environment Variables
In Railway, go to your service → **"Variables"** tab and add:

```
MONGODB_URI=mongodb+srv://your-username:your-password@cluster.mongodb.net/hr_system?retryWrites=true&w=majority
DATABASE_NAME=hr_system
JWT_SECRET=your-super-secret-jwt-key-change-this-to-random-string
JWT_EXPIRATION=24h
NODE_ENV=production
FRONTEND_URL=https://your-frontend-url.netlify.app
```

**Important Notes:**
- Replace `MONGODB_URI` with your actual MongoDB connection string from Step 1.5
- Replace `JWT_SECRET` with a long random string (use a password generator)
- Replace `FRONTEND_URL` with your Netlify URL (you'll get this in Step 3)
- **DO NOT set `PORT`** - Railway sets this automatically

### 2.5 Deploy
1. Railway will automatically start building and deploying
2. Wait 3-5 minutes for the first deployment
3. Once deployed, Railway will provide a URL like: `https://your-app-name.up.railway.app`
4. Your API will be available at: `https://your-app-name.up.railway.app/api/v1`

### 2.6 Enable Auto-Deploy
1. Auto-deploy is enabled by default!
2. Every push to your GitHub `main` branch will automatically deploy

---

## Step 3: Deploy Frontend to Netlify

### 3.1 Create Netlify Account
1. Go to [https://netlify.com](https://netlify.com)
2. Click **"Sign up"**
3. Sign up with your GitHub account (recommended)

### 3.2 Import Your Project
1. In Netlify dashboard, click **"Add new site"** → **"Import an existing project"**
2. Choose **"Deploy with GitHub"**
3. Authorize Netlify to access your GitHub if prompted
4. Select your repository (`sw-project-2`)

### 3.3 Configure Build Settings
Netlify will auto-detect the `netlify.toml` configuration. The settings are:
- **Base directory:** `frontend`
- **Build command:** `npm run build`
- **Publish directory:** `.next`
- **Node version:** `20`

These are already configured in `netlify.toml`, so you can use the defaults.

### 3.4 Set Environment Variables
Before deploying, click **"Show advanced"** → **"New variable"** and add:

```
NEXT_PUBLIC_API_URL=https://your-railway-backend-url.up.railway.app/api/v1
```

**Important:**
- Replace `your-railway-backend-url.up.railway.app` with your actual Railway backend URL from Step 2.5
- Make sure to include `/api/v1` at the end

### 3.5 Deploy
1. Click **"Deploy site"**
2. Netlify will build and deploy your frontend (usually takes 2-3 minutes)
3. Once deployed, you'll get a URL like: `https://random-name-12345.netlify.app`
4. You can also set a custom domain later

### 3.6 Enable Auto-Deploy
- Auto-deploy is enabled by default!
- Every push to your GitHub `main` branch will automatically deploy

### 3.7 Update Backend CORS
1. Go back to Railway → Your backend service
2. Go to **"Variables"** tab
3. Update `FRONTEND_URL` to your Netlify URL:
   ```
   FRONTEND_URL=https://your-frontend-name.netlify.app
   ```
4. Railway will automatically redeploy with the new CORS settings

---

## Step 4: Verify Deployment

### 4.1 Test Backend
1. Open your Railway backend URL: `https://your-app-name.up.railway.app/api/v1`
2. You should see a response or API documentation
3. Test an endpoint (may require authentication)

### 4.2 Test Frontend
1. Open your Netlify frontend URL: `https://your-frontend-name.netlify.app`
2. The app should load
3. Try logging in (if you have test credentials)
4. Check browser console for any API connection errors

### 4.3 Test Auto-Deploy
1. Make a small change to your code
2. Push to GitHub:
   ```bash
   git add .
   git commit -m "Test auto-deploy"
   git push origin main
   ```
3. Check Railway and Netlify dashboards
4. You should see new deployments starting automatically!

---

## Environment Variables Summary

### Backend (Railway)
| Variable | Value | Example |
|----------|-------|---------|
| `MONGODB_URI` | Your MongoDB connection string | `mongodb+srv://user:pass@cluster.mongodb.net/hr_system` |
| `DATABASE_NAME` | Database name | `hr_system` |
| `JWT_SECRET` | Random secret key | `my-super-secret-key-12345` |
| `JWT_EXPIRATION` | Token expiration | `24h` |
| `NODE_ENV` | Environment | `production` |
| `FRONTEND_URL` | Your Netlify frontend URL | `https://your-app.netlify.app` |
| `PORT` | **DO NOT SET** - Railway sets this automatically | - |

### Frontend (Netlify)
| Variable | Value | Example |
|----------|-------|---------|
| `NEXT_PUBLIC_API_URL` | Your Railway backend URL + `/api/v1` | `https://your-app.up.railway.app/api/v1` |

---

## Troubleshooting

### Backend Issues (Railway)

**Problem: Backend shows "Application Error"**
- Check Railway logs: Go to your service → "Deployments" → Click on latest deployment → "View Logs"
- Verify all environment variables are set correctly
- Make sure MongoDB connection string is correct
- Check that `PORT` is NOT set (Railway sets it automatically)

**Problem: Build fails**
- Check Railway build logs
- Verify `nixpacks.toml` is in the root directory
- Make sure all dependencies are in `backend/package.json`

**Problem: CORS errors**
- Make sure `FRONTEND_URL` in Railway matches your Netlify URL exactly
- Check that CORS is configured in `backend/src/main.ts` (already done - allows all `.netlify.app` domains)

### Frontend Issues (Netlify)

**Problem: Frontend can't connect to backend**
- Verify `NEXT_PUBLIC_API_URL` is set correctly in Netlify
- Make sure the URL includes `/api/v1` at the end
- Check browser console for CORS errors
- Verify backend is running (check Railway dashboard)

**Problem: Build fails on Netlify**
- Check Netlify build logs
- Make sure `Root Directory` is set to `frontend` (configured in `netlify.toml`)
- Verify all dependencies are in `frontend/package.json`

**Problem: 404 errors on page refresh**
- This is handled by Next.js and Netlify plugin automatically
- The `@netlify/plugin-nextjs` plugin in `netlify.toml` handles this

### Database Issues

**Problem: Can't connect to MongoDB**
- Verify MongoDB connection string is correct
- Check that your IP is whitelisted in MongoDB Atlas (or use "Allow Access from Anywhere")
- Make sure database user password is correct
- Check MongoDB Atlas logs

---

## 🎉 Success Checklist

- [ ] MongoDB Atlas cluster created and running
- [ ] Backend deployed to Railway
- [ ] Frontend deployed to Netlify
- [ ] All environment variables configured
- [ ] Backend URL accessible
- [ ] Frontend URL accessible
- [ ] Frontend can communicate with backend
- [ ] Auto-deploy working (test with a small change)

---

## 📝 Important Notes

### Free Tier Limitations

**Railway Free Tier:**
- $5 free credit per month
- Services may sleep after inactivity (paid plans keep services awake)
- Perfect for development and small apps

**Netlify Free Tier:**
- Unlimited deployments
- 100GB bandwidth/month
- Perfect for Next.js apps
- No spin-down (always fast)

**MongoDB Atlas Free Tier:**
- 512MB storage
- Shared RAM and CPU
- Perfect for development and small apps

### Cost
**Everything in this guide can be done for FREE!** 🎉

### Auto-Deploy
Both Railway and Netlify automatically deploy when you push to GitHub. No manual steps needed!

---

## 🔄 Updating Your Application

To update your deployed application:

1. Make changes to your code locally
2. Commit and push to GitHub:
   ```bash
   git add .
   git commit -m "Your update message"
   git push origin main
   ```
3. Railway and Netlify will automatically detect the push
4. They will build and deploy the new version
5. Your app will be updated in 2-5 minutes!

---

## 📞 Need Help?

If you encounter issues:
1. Check the logs in Railway and Netlify dashboards
2. Verify all environment variables are set correctly
3. Check that your GitHub repository is properly connected
4. Make sure MongoDB Atlas cluster is running

---

## 🎊 Congratulations!

Your HR Management System is now deployed and will automatically update whenever you push changes to GitHub!

**Your URLs:**
- Frontend: `https://your-frontend-name.netlify.app`
- Backend API: `https://your-app-name.up.railway.app/api/v1`
- Database: MongoDB Atlas (cloud-hosted)

Happy coding! 🚀

