const express = require('express');
const User = require('../models/User');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// Create/Update Profile
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { education, skills, sector, location } = req.body;

    const user = await User.findByIdAndUpdate(
      req.user._id,
      {
        profile: {
          education: education || '',
          skills: skills || [],
          sector: sector || '',
          location: location || ''
        }
      },
      { new: true, runValidators: true }
    ).select('-password');

    res.json({
      message: 'Profile updated successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        profile: user.profile
      }
    });

  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({ message: 'Server error updating profile' });
  }
});

// Get Profile
router.get('/', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    
    res.json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        profile: user.profile
      }
    });

  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ message: 'Server error fetching profile' });
  }
});

// Update Profile
router.put('/', authMiddleware, async (req, res) => {
  try {
    const { education, skills, sector, location } = req.body;

    const user = await User.findByIdAndUpdate(
      req.user._id,
      {
        'profile.education': education,
        'profile.skills': skills,
        'profile.sector': sector,
        'profile.location': location
      },
      { new: true, runValidators: true }
    ).select('-password');

    res.json({
      message: 'Profile updated successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        profile: user.profile
      }
    });

  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({ message: 'Server error updating profile' });
  }
});

module.exports = router;
