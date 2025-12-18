# 🚀 Free Deployment Guide - HR Management System

This guide will help you deploy your HR Management System for **FREE** with automatic updates from your GitHub repository.

## 📋 Table of Contents
1. [Overview](#overview)
2. [Prerequisites](#prerequisites)
3. [Step 1: Set Up MongoDB Atlas (Free Database)](#step-1-set-up-mongodb-atlas-free-database)
4. [Step 2: Deploy Backend to Render.com (Free)](#step-2-deploy-backend-to-rendercom-free)
5. [Step 3: Deploy Frontend to Vercel (Free)](#step-3-deploy-frontend-to-vercel-free)
6. [Step 4: Configure Environment Variables](#step-4-configure-environment-variables)
7. [Step 5: Test Your Deployment](#step-5-test-your-deployment)
8. [Troubleshooting](#troubleshooting)

---

## Overview

We'll use the following **FREE** services:
- **MongoDB Atlas**: Free cloud database (512MB storage)
- **Render.com**: Free backend hosting (NestJS API)
- **Vercel**: Free frontend hosting (Next.js) - Best for Next.js apps

All services support automatic deployment from GitHub!

---

## Prerequisites

Before starting, make sure you have:
1. ✅ Your code pushed to a GitHub repository
2. ✅ A GitHub account
3. ✅ An email address for account creation

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

## Step 2: Deploy Backend to Render.com (Free)

### 2.1 Create Render Account
1. Go to [https://render.com](https://render.com)
2. Click **"Get Started for Free"**
3. Sign up with your GitHub account (recommended for auto-deploy)

### 2.2 Create a New Web Service
1. In your Render dashboard, click **"New +"** → **"Web Service"**
2. Connect your GitHub account if not already connected
3. Select your repository (`sw-project-2`)
4. Configure the service:
   - **Name**: `hr-system-backend` (or any name you prefer)
   - **Region**: Choose closest to you
   - **Branch**: `main` (or your default branch)
   - **Root Directory**: `backend`
   - **Runtime**: `Node`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm run start:prod`

### 2.3 Set Environment Variables
Click **"Environment"** tab and add these variables:

```
MONGODB_URI=mongodb+srv://your-username:your-password@cluster.mongodb.net/hr_system?retryWrites=true&w=majority
DATABASE_NAME=hr_system
JWT_SECRET=your-super-secret-jwt-key-change-this-to-random-string
JWT_EXPIRATION=24h
NODE_ENV=production
PORT=10000
FRONTEND_URL=https://your-frontend-url.vercel.app
```

**Important Notes:**
- Replace `MONGODB_URI` with your actual MongoDB connection string from Step 1.5
- Replace `JWT_SECRET` with a long random string (use a password generator)
- Replace `FRONTEND_URL` with your Vercel URL (you'll get this in Step 3)
- `PORT` is set to 10000 (Render's default, but you can use any port)

### 2.4 Deploy
1. Click **"Create Web Service"**
2. Render will start building and deploying your backend
3. Wait 5-10 minutes for the first deployment
4. Once deployed, you'll get a URL like: `https://hr-system-backend.onrender.com`

**⚠️ Important:** Render free tier services "spin down" after 15 minutes of inactivity. The first request after spin-down takes ~30 seconds. This is normal for free tier.

### 2.5 Enable Auto-Deploy
1. Go to your service settings
2. Under **"Auto-Deploy"**, make sure it's set to **"Yes"**
3. Now every push to your GitHub `main` branch will automatically deploy!

---

## Step 3: Deploy Frontend to Vercel (Free)

### 3.1 Create Vercel Account
1. Go to [https://vercel.com](https://vercel.com)
2. Click **"Sign Up"**
3. Sign up with your GitHub account (recommended)

### 3.2 Import Your Project
1. In Vercel dashboard, click **"Add New..."** → **"Project"**
2. Import your GitHub repository (`sw-project-2`)
3. Configure the project:
   - **Framework Preset**: Next.js (auto-detected)
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build` (default)
   - **Output Directory**: `.next` (default)
   - **Install Command**: `npm install`

### 3.3 Set Environment Variables
Click **"Environment Variables"** and add:

```
NEXT_PUBLIC_API_URL=https://your-backend-url.onrender.com/api/v1
```

**Important:**
- Replace `your-backend-url.onrender.com` with your actual Render backend URL from Step 2.4

### 3.4 Deploy
1. Click **"Deploy"**
2. Vercel will build and deploy your frontend (usually takes 2-3 minutes)
3. Once deployed, you'll get a URL like: `https://sw-project-2.vercel.app`

### 3.5 Enable Auto-Deploy
- Auto-deploy is enabled by default!
- Every push to your GitHub `main` branch will automatically deploy

### 3.6 Update Backend CORS
1. Go back to Render.com → Your backend service
2. Go to **"Environment"** tab
3. Update `FRONTEND_URL` to your Vercel URL:
   ```
   FRONTEND_URL=https://sw-project-2.vercel.app
   ```
4. Click **"Save Changes"** - Render will automatically redeploy

---

## Step 4: Configure Environment Variables

### Backend Environment Variables (Render.com)
Make sure these are set in Render:

| Variable | Value | Example |
|----------|-------|---------|
| `MONGODB_URI` | Your MongoDB connection string | `mongodb+srv://user:pass@cluster.mongodb.net/hr_system` |
| `DATABASE_NAME` | Database name | `hr_system` |
| `JWT_SECRET` | Random secret key | `my-super-secret-key-12345` |
| `JWT_EXPIRATION` | Token expiration | `24h` |
| `NODE_ENV` | Environment | `production` |
| `PORT` | Server port | `10000` |
| `FRONTEND_URL` | Your Vercel frontend URL | `https://sw-project-2.vercel.app` |

### Frontend Environment Variables (Vercel)
Make sure this is set in Vercel:

| Variable | Value | Example |
|----------|-------|---------|
| `NEXT_PUBLIC_API_URL` | Your Render backend URL + `/api/v1` | `https://hr-system-backend.onrender.com/api/v1` |

---

## Step 5: Test Your Deployment

### 5.1 Test Backend
1. Open your backend URL: `https://your-backend.onrender.com/api/v1`
2. You should see a response (or check if the API is running)
3. Test an endpoint: `https://your-backend.onrender.com/api/v1/employee-profile` (may require auth)

### 5.2 Test Frontend
1. Open your frontend URL: `https://your-frontend.vercel.app`
2. The app should load
3. Try logging in (if you have test credentials)

### 5.3 Test Auto-Deploy
1. Make a small change to your code
2. Push to GitHub:
   ```bash
   git add .
   git commit -m "Test auto-deploy"
   git push origin main
   ```
3. Check Render.com and Vercel.com dashboards
4. You should see new deployments starting automatically!

---

## Troubleshooting

### Backend Issues

**Problem: Backend shows "Application Error"**
- Check Render logs: Go to your service → "Logs" tab
- Verify all environment variables are set correctly
- Make sure MongoDB connection string is correct
- Check that `PORT` environment variable is set

**Problem: Backend takes 30+ seconds to respond**
- This is normal for Render free tier (services spin down after 15 min inactivity)
- First request after spin-down takes time to wake up
- Consider upgrading to paid tier for always-on service

**Problem: CORS errors**
- Make sure `FRONTEND_URL` in backend matches your Vercel URL exactly
- Check that CORS is configured in `backend/src/main.ts`

### Frontend Issues

**Problem: Frontend can't connect to backend**
- Verify `NEXT_PUBLIC_API_URL` is set correctly in Vercel
- Make sure the URL includes `/api/v1` at the end
- Check browser console for CORS errors
- Verify backend is running (check Render dashboard)

**Problem: Build fails on Vercel**
- Check Vercel build logs
- Make sure `Root Directory` is set to `frontend`
- Verify all dependencies are in `package.json`

### Database Issues

**Problem: Can't connect to MongoDB**
- Verify MongoDB connection string is correct
- Check that your IP is whitelisted in MongoDB Atlas
- Make sure database user password is correct
- Check MongoDB Atlas logs

**Problem: Database connection timeout**
- Check MongoDB Atlas cluster status
- Verify network access settings
- Make sure connection string includes `?retryWrites=true&w=majority`

---

## 🎉 Success Checklist

- [ ] MongoDB Atlas cluster created and running
- [ ] Backend deployed to Render.com
- [ ] Frontend deployed to Vercel
- [ ] All environment variables configured
- [ ] Backend URL accessible
- [ ] Frontend URL accessible
- [ ] Frontend can communicate with backend
- [ ] Auto-deploy working (test with a small change)

---

## 📝 Important Notes

### Free Tier Limitations

**Render.com Free Tier:**
- Services spin down after 15 minutes of inactivity
- First request after spin-down takes ~30 seconds
- 750 hours/month free (enough for 24/7 single service)
- Limited to 1 web service on free tier

**Vercel Free Tier:**
- Unlimited deployments
- 100GB bandwidth/month
- Perfect for Next.js apps
- No spin-down (always fast)

**MongoDB Atlas Free Tier:**
- 512MB storage
- Shared RAM and CPU
- Perfect for development and small apps

### Cost
**Everything in this guide is 100% FREE!** 🎉

### Auto-Deploy
Both Render and Vercel automatically deploy when you push to GitHub. No manual steps needed!

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
3. Render and Vercel will automatically detect the push
4. They will build and deploy the new version
5. Your app will be updated in 2-5 minutes!

---

## 📞 Need Help?

If you encounter issues:
1. Check the logs in Render.com and Vercel.com dashboards
2. Verify all environment variables are set correctly
3. Check that your GitHub repository is properly connected
4. Make sure MongoDB Atlas cluster is running

---

## 🎊 Congratulations!

Your HR Management System is now deployed and will automatically update whenever you push changes to GitHub!

**Your URLs:**
- Frontend: `https://your-frontend.vercel.app`
- Backend API: `https://your-backend.onrender.com/api/v1`
- Database: MongoDB Atlas (cloud-hosted)

Happy coding! 🚀

