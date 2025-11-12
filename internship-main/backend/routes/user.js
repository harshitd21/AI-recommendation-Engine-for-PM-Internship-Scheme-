const express = require('express');
const User = require('../models/User');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// Get current user basics (including onboarding flag)
router.get('/me', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        hasOnboarded: user.hasOnboarded,
        profile: user.profile,
      }
    });
  } catch (err) {
    console.error('Get me error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Mark onboarding complete
router.post('/onboarded', authMiddleware, async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { hasOnboarded: true },
      { new: true }
    ).select('-password');
    res.json({ message: 'Onboarding completed', user: { id: user._id, hasOnboarded: user.hasOnboarded } });
  } catch (err) {
    console.error('Onboarded error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
