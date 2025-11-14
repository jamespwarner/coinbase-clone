const express = require('express');
const jwt = require('jsonwebtoken');
const validator = require('validator');
const User = require('../models/User');
const auth = require('../middleware/auth');

const router = express.Router();

// Register
router.post('/register', async (req, res) => {
  try {
    const { email, password, firstName, lastName, phoneNumber } = req.body;

    // Validation
    if (!email || !password || !firstName || !lastName) {
      return res.status(400).json({ 
        error: 'Please provide email, password, first name, and last name' 
      });
    }

    if (!validator.isEmail(email)) {
      return res.status(400).json({ error: 'Please provide a valid email' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    // Use in-memory storage if MongoDB is not available
    if (req.app.locals.useInMemoryStorage()) {
      const inMemoryUsers = req.app.locals.inMemoryUsers;
      
      // Check if user already exists in memory
      for (const [userId, userData] of inMemoryUsers) {
        if (userData.email === email) {
          return res.status(400).json({ error: 'User with this email already exists' });
        }
      }

      // Create user in memory
      const bcrypt = require('bcryptjs');
      const hashedPassword = await bcrypt.hash(password, 10);
      const userId = Date.now().toString();
      
      const userData = {
        _id: userId,
        email,
        password: hashedPassword,
        firstName,
        lastName,
        phoneNumber,
        createdAt: new Date()
      };
      
      inMemoryUsers.set(userId, userData);

      // Generate JWT token
      const token = jwt.sign(
        { userId: userId },
        process.env.JWT_SECRET || 'coinbase-replica-secret',
        { expiresIn: '7d' }
      );

      res.status(201).json({
        message: 'User registered successfully',
        token,
        user: {
          id: userId,
          email: userData.email,
          firstName: userData.firstName,
          lastName: userData.lastName
        }
      });
    } else {
      // MongoDB flow
      // Check if user already exists
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ error: 'User with this email already exists' });
      }

      // Create new user
      const user = new User({
        email,
        password,
        firstName,
        lastName,
        phoneNumber
      });

      await user.save();

      // Generate JWT token
      const token = jwt.sign(
        { userId: user._id },
        process.env.JWT_SECRET || 'coinbase-replica-secret',
        { expiresIn: '7d' }
      );

      res.status(201).json({
        message: 'User created successfully',
        user,
        token
      });
    }
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Server error during registration' });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({ error: 'Please provide email and password' });
    }

    if (!validator.isEmail(email)) {
      return res.status(400).json({ error: 'Please provide a valid email' });
    }

    // Use in-memory storage if MongoDB is not available
    if (req.app.locals.useInMemoryStorage()) {
      const inMemoryUsers = req.app.locals.inMemoryUsers;
      
      // Find user in memory
      let user = null;
      for (const [userId, userData] of inMemoryUsers) {
        if (userData.email === email) {
          user = userData;
          break;
        }
      }
      
      if (!user) {
        return res.status(400).json({ error: 'Invalid credentials' });
      }

      // Check password
      const bcrypt = require('bcryptjs');
      const isPasswordMatch = await bcrypt.compare(password, user.password);
      if (!isPasswordMatch) {
        return res.status(400).json({ error: 'Invalid credentials' });
      }

      // Generate JWT token
      const token = jwt.sign(
        { userId: user._id },
        process.env.JWT_SECRET || 'coinbase-replica-secret',
        { expiresIn: '7d' }
      );

      res.json({
        message: 'Login successful',
        user: {
          id: user._id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName
        },
        token
      });
    } else {
      // MongoDB flow
      // Find user
      const user = await User.findOne({ email });
      if (!user) {
        return res.status(400).json({ error: 'Invalid credentials' });
      }

      // Check password
      const isPasswordMatch = await user.comparePassword(password);
      if (!isPasswordMatch) {
        return res.status(400).json({ error: 'Invalid credentials' });
      }

      // Generate JWT token
      const token = jwt.sign(
        { userId: user._id },
        process.env.JWT_SECRET || 'coinbase-replica-secret',
        { expiresIn: '7d' }
      );

      res.json({
        message: 'Login successful',
        user,
        token
      });
    }
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Server error during login' });
  }
});

// Get current user
router.get('/me', auth, async (req, res) => {
  res.json(req.user);
});

// Logout (client-side token removal)
router.post('/logout', auth, (req, res) => {
  res.json({ message: 'Logout successful' });
});

module.exports = router;