# 🚀 Quick Start Deployment Checklist

## Prerequisites
- [ ] Code pushed to GitHub repository
- [ ] GitHub account ready

---

## Step-by-Step Quick Checklist

### 1️⃣ MongoDB Atlas Setup (5 minutes)
- [ ] Sign up at [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas/register)
- [ ] Create M0 FREE cluster
- [ ] Create database user (save username/password!)
- [ ] Whitelist IP: "Allow Access from Anywhere"
- [ ] Get connection string: `mongodb+srv://user:pass@cluster.mongodb.net/hr_system`
- [ ] ✅ **Save connection string!**

---

### 2️⃣ Deploy Backend to Render (10 minutes)
- [ ] Sign up at [render.com](https://render.com) (use GitHub login)
- [ ] New → Web Service
- [ ] Connect GitHub repo → Select `sw-project-2`
- [ ] Settings:
  - Root Directory: `backend`
  - Build Command: `npm install && npm run build`
  - Start Command: `npm run start:prod`
- [ ] Add Environment Variables:
  ```
  MONGODB_URI=your-mongodb-connection-string
  DATABASE_NAME=hr_system
  JWT_SECRET=generate-random-secret-key
  JWT_EXPIRATION=24h
  NODE_ENV=production
  PORT=10000
  FRONTEND_URL=https://your-frontend.vercel.app (update after step 3)
  ```
- [ ] Deploy → Wait 5-10 minutes
- [ ] ✅ **Save backend URL:** `https://your-backend.onrender.com`

---

### 3️⃣ Deploy Frontend to Vercel (5 minutes)
- [ ] Sign up at [vercel.com](https://vercel.com) (use GitHub login)
- [ ] Add New Project → Import `sw-project-2`
- [ ] Settings:
  - Root Directory: `frontend`
  - Framework: Next.js (auto-detected)
- [ ] Add Environment Variable:
  ```
  NEXT_PUBLIC_API_URL=https://your-backend.onrender.com/api/v1
  ```
- [ ] Deploy → Wait 2-3 minutes
- [ ] ✅ **Save frontend URL:** `https://your-frontend.vercel.app`

---

### 4️⃣ Update Backend CORS (2 minutes)
- [ ] Go back to Render.com → Your backend service
- [ ] Environment tab → Update `FRONTEND_URL` to your Vercel URL
- [ ] Save → Auto-redeploys

---

### 5️⃣ Test Everything
- [ ] Open frontend URL in browser
- [ ] Check if app loads
- [ ] Test login (if you have credentials)
- [ ] Make a small code change
- [ ] Push to GitHub: `git push origin main`
- [ ] Verify auto-deploy works (check Render & Vercel dashboards)

---

## 🎯 Your Deployment URLs

After deployment, you'll have:
- **Frontend:** `https://your-project.vercel.app`
- **Backend API:** `https://your-backend.onrender.com/api/v1`
- **Database:** MongoDB Atlas (cloud)

---

## 🔄 How Auto-Deploy Works

1. You push code to GitHub: `git push origin main`
2. Render detects the push → Builds backend → Deploys
3. Vercel detects the push → Builds frontend → Deploys
4. Your app is updated automatically! ✨

**No manual steps needed after initial setup!**

---

## ⚠️ Important Notes

### Render Free Tier
- Services "spin down" after 15 min inactivity
- First request after spin-down takes ~30 seconds (normal!)
- This is free tier limitation

### Environment Variables
- **Never commit** `.env` files to GitHub
- Always set variables in Render/Vercel dashboards
- Use strong `JWT_SECRET` (random string generator)

### MongoDB Connection
- Keep your connection string secure
- Don't share it publicly
- Update password if compromised

---

## 🆘 Quick Troubleshooting

| Problem | Solution |
|---------|----------|
| Backend error | Check Render logs, verify env variables |
| Frontend can't connect | Check `NEXT_PUBLIC_API_URL` is correct |
| CORS errors | Update `FRONTEND_URL` in backend |
| Slow first request | Normal for Render free tier (spin-down) |
| Build fails | Check logs, verify root directory settings |

---

## ✅ Success!

Once all checkboxes are done, your app is live and auto-deploying! 🎉

**For detailed instructions, see `DEPLOYMENT_GUIDE.md`**

