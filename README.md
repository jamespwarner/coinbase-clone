# Coinbase Website Replica

A complete full-stack replica of the Coinbase website with authentication, user dashboard, and real-time admin monitoring capabilities.

## 🚀 Features

### Frontend (React)
- **Exact Coinbase UI Replica**: Pixel-perfect recreation of Coinbase's homepage, navigation, and design
- **Authentication Pages**: Login and signup forms with validation
- **User Dashboard**: Portfolio view, crypto assets, market overview
- **Real-time Updates**: Live user activity and portfolio changes
- **Responsive Design**: Mobile-friendly interface

### Backend (Node.js/Express)
- **RESTful API**: Complete authentication and user management
- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: Bcrypt encryption for user passwords
- **MongoDB Integration**: User data and portfolio storage
- **Real-time Monitoring**: Socket.io for live user tracking

### Admin Dashboard
- **Live User Monitoring**: Real-time active users tracking
- **Credential Logging**: Monitor all login/signup activities in real-time
- **User Analytics**: Total users, new registrations, verification status
- **User Management**: View and delete user accounts
- **Real-time Activity Feed**: Live updates of user actions

## 📦 Tech Stack

- **Frontend**: React, React Router, Socket.io Client, Axios
- **Backend**: Node.js, Express, Socket.io, JWT, Bcrypt
- **Database**: MongoDB with Mongoose
- **Styling**: Custom CSS (Coinbase-inspired design system)
- **Real-time**: WebSocket connections for live monitoring

## 🛠️ Installation

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local or cloud instance)
- npm or yarn

### Setup Instructions

1. **Clone and install dependencies**:
   ```bash
   cd ASHWIN
   npm run install-all
   ```

2. **Configure MongoDB**:
   - Install MongoDB locally OR use MongoDB Atlas (cloud)
   - Update `MONGODB_URI` in `server/.env` if using cloud database

3. **Environment Variables**:
   ```bash
   # server/.env
   NODE_ENV=development
   PORT=5001
   MONGODB_URI=mongodb://localhost:27017/coinbase-replica
   JWT_SECRET=your-secret-key
   ADMIN_KEY=admin123
   ```

4. **Start Development Servers**:
   ```bash
   # Option 1: Start both servers simultaneously
   npm run dev

   # Option 2: Start servers separately
   # Terminal 1 - Backend
   npm run server

   # Terminal 2 - Frontend
   npm run client
   ```

## 🌐 Access the Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5001
- **Admin Dashboard**: http://localhost:3000/admin (Password: admin123)

## 📱 Application Features

### 1. Homepage
- Coinbase-style hero section
- Crypto price displays
- Trust indicators and company information
- Complete footer with all Coinbase links

### 2. Authentication
- **Sign Up**: Full user registration with validation
- **Sign In**: Secure login with JWT tokens
- **Real-time Tracking**: All auth events are monitored live

### 3. User Dashboard
- Portfolio overview with balance
- Crypto assets display
- Market overview with live prices
- Buy/Sell/Send/Receive buttons (UI ready)

### 4. Admin Dashboard
- **Live Activity Monitor**: Real-time user actions
- **Active Users**: Currently connected users
- **Credentials Log**: All login/signup attempts with timestamps
- **User Management**: Complete user database with admin controls
- **Analytics**: User statistics and growth metrics

## 🔄 Real-time Features

### WebSocket Events
- `user-login`: Triggered when user signs in
- `user-signup`: Triggered when user registers
- `user-activity`: Broadcast user actions to admin dashboard
- `disconnect`: Track when users leave

### Admin Monitoring
- Live user count updates
- Real-time credential capture
- Instant activity notifications
- Socket connection tracking

## 🎨 Design System

### Coinbase Brand Colors
- Primary Blue: `#0052ff`
- Dark Blue: `#004cd6`
- Light Gray: `#f5f7f8`
- Success Green: `#05d168`
- Error Red: `#f05350`

### Components
- Custom buttons matching Coinbase style
- Form components with validation
- Navigation with responsive design
- Dashboard cards and statistics
- Tables for data display

## 🔐 Security Features

- **JWT Authentication**: Secure token-based auth
- **Password Hashing**: Bcrypt with salt rounds
- **Input Validation**: Server-side validation
- **Rate Limiting**: API request throttling
- **CORS Configuration**: Cross-origin security
- **Helmet**: Security headers

## 📊 Admin Features

### User Analytics
- Total registered users
- New users in last 24 hours
- Verified vs unverified users
- Active users count

### Real-time Monitoring
- Live user activity feed
- Active sessions tracking
- Credential capture with timestamps
- Socket connection monitoring

### User Management
- View all user profiles
- User verification status
- Delete user accounts
- User registration history

## 🚀 Deployment

### Quick Deploy to Free Hosting

Want to deploy for FREE? See our quick guides:

- 🚀 **[QUICK_DEPLOY.md](./QUICK_DEPLOY.md)** - 5-minute deployment guide
- 📖 **[DEPLOYMENT.md](./DEPLOYMENT.md)** - Detailed step-by-step instructions

### Free Hosting Platforms

- **Frontend**: Vercel (Unlimited free tier)
- **Backend**: Railway ($5 credit/month) or Render (750 hours/month)
- **Database**: MongoDB Atlas (512MB free) or use in-memory storage

### Production Build

```bash
# Prepare for deployment
./deploy-prep.sh

# Or manually:
# Build frontend
cd client
npm run build

# Start production server
cd ../server
npm start
```

### Environment Configuration

**Backend (.env)**:
```env
NODE_ENV=production
PORT=5001
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_super_secret_key_min_32_characters
ADMIN_KEY=admin123
FRONTEND_URL=https://your-frontend-url.vercel.app
```

**Frontend (Vercel Environment Variables)**:
```env
REACT_APP_API_URL=https://your-backend-url.railway.app/api
REACT_APP_SOCKET_URL=https://your-backend-url.railway.app
```

### Deployment Checklist

- [ ] Push code to GitHub
- [ ] Deploy backend to Railway/Render
- [ ] Configure backend environment variables
- [ ] Deploy frontend to Vercel
- [ ] Configure frontend environment variables
- [ ] Update CORS settings with production URL
- [ ] Test authentication flow
- [ ] Verify dashboard functionality

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed instructions.

## 📱 Mobile Support

- Fully responsive design
- Mobile-optimized navigation
- Touch-friendly buttons
- Responsive tables and cards
- Mobile dashboard layout

## 🤝 Contributing

This is a demonstration project showcasing full-stack development capabilities with real-time features.

## 📄 License

MIT License - Created for educational purposes as a Coinbase interface replica.

## ⚠️ Disclaimer

This is a replica/clone created for educational purposes only. It is not affiliated with or endorsed by Coinbase. This project demonstrates web development skills and should not be used for actual cryptocurrency trading.

---

**Built with ❤️ using React, Node.js, and Socket.io**