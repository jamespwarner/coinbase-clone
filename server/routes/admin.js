const express = require('express');
const User = require('../models/User');

const router = express.Router();

// Admin middleware (simple check for demo purposes)
const adminAuth = (req, res, next) => {
  const adminKey = req.header('X-Admin-Key');
  const expectedKey = process.env.ADMIN_KEY || 'admin123';
  console.log('Admin auth attempt:', { adminKey, expectedKey, match: adminKey === expectedKey });
  
  if (adminKey !== expectedKey) {
    return res.status(403).json({ error: 'Access denied. Admin privileges required.' });
  }
  next();
};

// Get all users
router.get('/users', adminAuth, async (req, res) => {
  try {
    console.log('Getting users, checking storage type...');
    console.log('useInMemoryStorage function exists:', typeof req.app.locals.useInMemoryStorage);
    console.log('useInMemoryStorage result:', req.app.locals.useInMemoryStorage ? req.app.locals.useInMemoryStorage() : 'function not found');
    
    // Use in-memory storage if MongoDB is not available
    if (req.app.locals.useInMemoryStorage && req.app.locals.useInMemoryStorage()) {
      console.log('Using in-memory storage');
      const inMemoryUsers = req.app.locals.inMemoryUsers;
      console.log('inMemoryUsers size:', inMemoryUsers ? inMemoryUsers.size : 'undefined');
      
      const users = Array.from(inMemoryUsers.values()).map(user => ({
        _id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        createdAt: user.createdAt
      }));
      
      console.log('Returning users:', users);
      res.json({
        count: users.length,
        users: users
      });
    } else {
      const users = await User.find().select('-password').sort({ createdAt: -1 });
      res.json({
        count: users.length,
        users: users
      });
    }
  } catch (error) {
    console.error('Admin users fetch error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get user analytics
router.get('/analytics', adminAuth, async (req, res) => {
  try {
    // Use in-memory storage if MongoDB is not available
    if (req.app.locals.useInMemoryStorage()) {
      const inMemoryUsers = req.app.locals.inMemoryUsers;
      const users = Array.from(inMemoryUsers.values());
      const totalUsers = users.length;
      const recentUsers = users.filter(user => 
        user.createdAt && user.createdAt > new Date(Date.now() - 24 * 60 * 60 * 1000)
      ).length;
      
      res.json({
        totalUsers,
        recentUsers,
        verifiedUsers: 0, // For in-memory demo
        unverifiedUsers: totalUsers
      });
    } else {
      const totalUsers = await User.countDocuments();
      const recentUsers = await User.countDocuments({
        createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
      });
      const verifiedUsers = await User.countDocuments({ isVerified: true });

      res.json({
        totalUsers,
        recentUsers,
        verifiedUsers,
        unverifiedUsers: totalUsers - verifiedUsers
      });
    }
  } catch (error) {
    console.error('Admin analytics error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete user (for demo purposes)
router.delete('/users/:userId', adminAuth, async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Admin user delete error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;