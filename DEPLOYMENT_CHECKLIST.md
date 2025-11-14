# ✅ Pre-Deployment Checklist

Use this checklist before deploying to ensure everything is ready.

## 📋 Code Preparation

### Backend Checks
- [ ] All dependencies installed (`npm install` in server/)
- [ ] `.env.example` file exists with all required variables
- [ ] Server starts without errors (`npm start`)
- [ ] API endpoints respond correctly
- [ ] In-memory storage fallback works (no MongoDB required)
- [ ] JWT secret is set
- [ ] Admin key is configured
- [ ] CORS is configured for dynamic frontend URL

### Frontend Checks
- [ ] All dependencies installed (`npm install` in client/)
- [ ] `.env.example` file exists
- [ ] App runs locally (`npm start`)
- [ ] Build completes successfully (`npm run build`)
- [ ] API URL uses environment variable
- [ ] Socket.io URL uses environment variable
- [ ] No hardcoded localhost URLs in code

## 🔐 Security Checks

- [ ] No `.env` files committed to Git
- [ ] `.gitignore` includes `.env`, `.env.local`, `node_modules`
- [ ] JWT secret is at least 32 characters
- [ ] Admin key is strong (change from default in production)
- [ ] No API keys or secrets in frontend code
- [ ] CORS configured for specific domain (not `*`)

## 📁 Git Repository

- [ ] Code pushed to GitHub
- [ ] Repository is public (for free deployments)
- [ ] `.gitignore` properly configured
- [ ] `README.md` updated with project info
- [ ] Deployment guides included

## 🌐 Hosting Accounts Setup

### Backend Hosting
- [ ] Railway account created (or Render)
- [ ] GitHub connected to hosting platform
- [ ] Payment method added (for Railway - no charges on free tier)

### Frontend Hosting
- [ ] Vercel account created
- [ ] GitHub connected to Vercel

### Database (Optional)
- [ ] MongoDB Atlas account created
- [ ] Free cluster created
- [ ] Database user created
- [ ] Network access configured (0.0.0.0/0)
- [ ] Connection string obtained

## 🚀 Deployment Steps

### 1. Deploy Backend First
- [ ] Backend deployed to Railway/Render
- [ ] All environment variables configured:
  - [ ] `NODE_ENV=production`
  - [ ] `PORT=5001` (or auto-assigned)
  - [ ] `JWT_SECRET` (32+ characters)
  - [ ] `ADMIN_KEY`
  - [ ] `MONGODB_URI` (or skip for in-memory)
  - [ ] `FRONTEND_URL` (will add after frontend deployed)
- [ ] Backend URL copied (e.g., `https://app.railway.app`)
- [ ] Backend accessible (test with `/api/health` or similar)
- [ ] Build logs checked (no errors)

### 2. Deploy Frontend
- [ ] Frontend deployed to Vercel
- [ ] Root directory set to `client`
- [ ] Build command: `npm run build`
- [ ] Output directory: `build`
- [ ] Environment variables configured:
  - [ ] `REACT_APP_API_URL` (backend URL + `/api`)
  - [ ] `REACT_APP_SOCKET_URL` (backend URL without `/api`)
- [ ] Frontend URL copied (e.g., `https://app.vercel.app`)
- [ ] Deployment successful
- [ ] No build errors

### 3. Update Backend CORS
- [ ] Go back to Railway/Render
- [ ] Add `FRONTEND_URL` environment variable with Vercel URL
- [ ] Redeploy backend
- [ ] Wait for deployment to complete

## 🧪 Testing Deployed Application

### Authentication Flow
- [ ] Visit frontend URL
- [ ] Sign up page loads correctly
- [ ] Can create new account
- [ ] Redirects to dashboard after signup
- [ ] Can log out
- [ ] Can log back in
- [ ] Dashboard displays user info

### API Communication
- [ ] Frontend successfully calls backend API
- [ ] No CORS errors in browser console
- [ ] User data persists (or in-memory works)
- [ ] Error messages display correctly

### Admin Dashboard
- [ ] Admin dashboard accessible at `/admin`
- [ ] Admin key authentication works
- [ ] Can view user list
- [ ] Real-time monitoring works (if WebSockets supported)

### General
- [ ] All pages load without errors
- [ ] No console errors in browser
- [ ] Mobile responsive design works
- [ ] Images and assets load correctly
- [ ] Navigation works properly

## 📊 Post-Deployment

### Documentation
- [ ] Update README with live URLs
- [ ] Document any deployment-specific notes
- [ ] Save environment variable values securely

### Monitoring
- [ ] Set up error monitoring (optional)
- [ ] Check hosting platform logs
- [ ] Monitor usage limits on free tier

### Sharing
- [ ] Test application from different devices
- [ ] Share live URL with others
- [ ] Gather feedback

## ⚠️ Common Issues to Check

- [ ] **CORS Error**: FRONTEND_URL matches exactly (no trailing slash)
- [ ] **API 404**: REACT_APP_API_URL includes `/api` at the end
- [ ] **Login Fails**: Check backend logs for errors
- [ ] **White Screen**: Check browser console, likely build issue
- [ ] **Slow Cold Start**: Railway/Render free tier sleeps after inactivity

## 🎉 Deployment Complete!

When all boxes are checked:
- ✅ Application is live
- ✅ Users can sign up and login
- ✅ Dashboard is functional
- ✅ Admin panel works
- ✅ All features working

### Your Live URLs:
```
Frontend: https://_____________________.vercel.app
Backend:  https://_____________________.railway.app
Admin:    https://_____________________.vercel.app/admin
```

### Default Credentials for Testing:
```
Email: test@coinbase.com
Password: test123
Admin Key: admin123
```

---

**🎊 Congratulations! Your Coinbase Clone is now live and accessible to the world!**
