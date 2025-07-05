const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const router = express.Router();

// JWT secret (should come from env in production)
const JWT_SECRET = process.env.JWT_SECRET || 'changeme-secret';

// Admin-only user creation route
const authenticateJWT = require('../middleware/auth');

router.post('/users', authenticateJWT, async (req, res) => {
  try {
    // Only admins can create users
    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Forbidden: Admins only.' });
    }
    const { username, password, role } = req.body;
    if (!username || !password || !role) {
      return res.status(400).json({ message: 'Username, password, and role are required.' });
    }
    const existing = await User.findOne({ username });
    if (existing) {
      return res.status(409).json({ message: 'Username already exists.' });
    }
    const passwordHash = await bcrypt.hash(password, 10);
    const user = new User({ username, passwordHash, role });
    await user.save();
    res.status(201).json({ message: 'User created successfully.' });
  } catch (err) {
    res.status(500).json({ message: 'User creation failed.', error: err.message });
  }
});

// Login route
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    console.log(`[LOGIN] Attempt for username: ${username}`);
    const user = await User.findOne({ username });
    if (!user) {
      console.log('[LOGIN] User not found:', username);
      return res.status(401).json({ message: 'Invalid credentials.' });
    }
    const valid = await bcrypt.compare(password, user.passwordHash);
    console.log(`[LOGIN] Password valid for ${username}:`, valid);
    if (!valid) return res.status(401).json({ message: 'Invalid credentials.' });
    const token = jwt.sign({ userId: user._id, username: user.username, role: user.role }, JWT_SECRET, { expiresIn: '2h' });
    res.json({ token, user: { username: user.username, role: user.role } });
  } catch (err) {
    console.error('[LOGIN] Error:', err);
    res.status(500).json({ message: 'Login failed.', error: err.message });
  }
});

module.exports = router;
