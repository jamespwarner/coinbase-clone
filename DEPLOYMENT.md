# 🚀 Deployment Guide - Coinbase Clone

This guide will help you deploy your Coinbase Clone application to free hosting platforms.

## 📋 Prerequisites

- GitHub account
- Your code pushed to a GitHub repository
- Accounts on hosting platforms (free):
  - [Vercel](https://vercel.com) - For Frontend
  - [Railway](https://railway.app) or [Render](https://render.com) - For Backend
  - [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) - For Database (optional)

---

## 🗄️ Step 1: Setup MongoDB Atlas (Free Database)

### Option A: Use MongoDB Atlas (Recommended for Production)

1. **Create MongoDB Atlas Account**
   - Go to https://www.mongodb.com/cloud/atlas
   - Sign up for free
   - Create a new project

2. **Create a Free Cluster**
   - Click "Build a Database"
   - Select "FREE" (M0) tier
   - Choose your cloud provider and region
   - Click "Create Cluster"

3. **Setup Database Access**
   - Go to "Database Access"
   - Click "Add New Database User"
   - Create username and password (save these!)
   - Select "Read and write to any database"

4. **Setup Network Access**
   - Go to "Network Access"
   - Click "Add IP Address"
   - Select "Allow Access from Anywhere" (0.0.0.0/0)
   - Click "Confirm"

5. **Get Connection String**
   - Go to "Database" → "Connect"
   - Select "Connect your application"
   - Copy the connection string
   - Replace `<password>` with your database user password
   - Example: `mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/coinbase?retryWrites=true&w=majority`

### Option B: Use In-Memory Storage (No Database Setup)

The app will automatically use in-memory storage if MongoDB is not available.

---

## 🔙 Step 2: Deploy Backend (Node.js Server)

### Option A: Deploy to Railway.app (Recommended)

1. **Sign Up for Railway**
   - Go to https://railway.app
   - Sign up with GitHub

2. **Create New Project**
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Select your repository
   - Choose the `server` folder

3. **Add Environment Variables**
   - Go to your project → "Variables"
   - Add the following:
     ```
     NODE_ENV=production
     PORT=5001
     MONGODB_URI=your_mongodb_atlas_connection_string
     JWT_SECRET=your_random_secret_key_min_32_chars
     ADMIN_KEY=admin123
     FRONTEND_URL=https://your-frontend-url.vercel.app
     ```

4. **Deploy**
   - Railway will automatically deploy
   - Copy your backend URL (e.g., `https://your-app.up.railway.app`)

### Option B: Deploy to Render.com

1. **Sign Up for Render**
   - Go to https://render.com
   - Sign up with GitHub

2. **Create Web Service**
   - Click "New" → "Web Service"
   - Connect your GitHub repository
   - Select the `server` folder

3. **Configure Service**
   - **Name**: coinbase-backend
   - **Environment**: Node
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Plan**: Free

4. **Add Environment Variables**
   - Add the same variables as Railway above

5. **Create Web Service**
   - Render will deploy automatically
   - Copy your backend URL

---

## 🎨 Step 3: Deploy Frontend (React App)

### Deploy to Vercel (Recommended)

1. **Sign Up for Vercel**
   - Go to https://vercel.com
   - Sign up with GitHub

2. **Import Project**
   - Click "Add New" → "Project"
   - Import your GitHub repository
   - Select the `client` folder

3. **Configure Project**
   - **Framework Preset**: Create React App
   - **Root Directory**: client
   - **Build Command**: `npm run build`
   - **Output Directory**: build

4. **Add Environment Variables**
   - Go to "Settings" → "Environment Variables"
   - Add:
     ```
     REACT_APP_API_URL=https://your-backend-url.railway.app/api
     REACT_APP_SOCKET_URL=https://your-backend-url.railway.app
     ```

5. **Deploy**
   - Click "Deploy"
   - Vercel will build and deploy your app
   - You'll get a URL like: `https://your-app.vercel.app`

6. **Update Backend FRONTEND_URL**
   - Go back to Railway/Render
   - Update the `FRONTEND_URL` environment variable with your Vercel URL
   - Redeploy the backend

---

## 🔧 Step 4: Final Configuration

### Update Backend CORS

Make sure your backend `FRONTEND_URL` environment variable is set to your Vercel frontend URL.

### Test the Deployment

1. Visit your Vercel URL
2. Try signing up with:
   - Email: test@example.com
   - Password: test123
3. Check if you can login and see the dashboard

---

## 🎯 Quick Deploy Commands

### For Local Testing Before Deployment

```bash
# In server directory
cd server
npm install
cp .env.example .env
# Edit .env with your values
npm start

# In client directory (new terminal)
cd client
npm install
npm start
```

### Build for Production

```bash
# Build frontend
cd client
npm run build

# Test production build locally
npm install -g serve
serve -s build
```

---

## 📱 Free Hosting Platforms Summary

| Platform | Best For | Free Tier | Custom Domain |
|----------|----------|-----------|---------------|
| **Vercel** | React Frontend | ✅ Unlimited | ✅ Yes |
| **Railway** | Node.js Backend | ✅ $5 credit/month | ✅ Yes |
| **Render** | Node.js Backend | ✅ 750 hours/month | ✅ Yes |
| **MongoDB Atlas** | Database | ✅ 512MB storage | ❌ No |

---

## 🔐 Environment Variables Reference

### Backend (.env)
```env
NODE_ENV=production
PORT=5001
MONGODB_URI=mongodb+srv://...
JWT_SECRET=your_super_secret_key_change_this
ADMIN_KEY=admin123
FRONTEND_URL=https://your-frontend.vercel.app
```

### Frontend (Vercel Environment Variables)
```env
REACT_APP_API_URL=https://your-backend.railway.app/api
REACT_APP_SOCKET_URL=https://your-backend.railway.app
```

---

## ✅ Post-Deployment Checklist

- [ ] Backend deployed and running
- [ ] Frontend deployed and accessible
- [ ] Environment variables configured
- [ ] CORS settings updated
- [ ] Database connected (or in-memory storage working)
- [ ] Sign up functionality working
- [ ] Sign in functionality working
- [ ] Dashboard displays user data
- [ ] Admin dashboard accessible

---

## 🐛 Troubleshooting

### Backend Issues

**Error: Cannot connect to database**
- Check MongoDB Atlas connection string
- Verify network access settings (0.0.0.0/0)
- The app will fallback to in-memory storage automatically

**Error: CORS policy error**
- Update `FRONTEND_URL` in backend environment variables
- Redeploy backend after changing variables

### Frontend Issues

**Error: Network request failed**
- Check `REACT_APP_API_URL` is set correctly
- Ensure backend is running and accessible
- Check browser console for exact error

**Error: Socket connection failed**
- Check `REACT_APP_SOCKET_URL` is set correctly
- Verify backend is running

---

## 📞 Support

If you encounter issues:
1. Check the browser console for errors
2. Check backend logs in Railway/Render dashboard
3. Verify all environment variables are set correctly
4. Make sure backend URL doesn't have trailing slash

---

## 🎉 Success!

Your Coinbase Clone is now live! Share your deployed URL:
- Frontend: `https://your-app.vercel.app`
- Backend API: `https://your-backend.railway.app/api`

**Default Test Credentials:**
- Email: test@coinbase.com
- Password: test123
- Admin Key: admin123
