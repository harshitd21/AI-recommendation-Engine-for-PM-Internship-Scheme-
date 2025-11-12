const express = require('express');
const Skill = require('../models/Skill');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// Get skills for current user
router.get('/', authMiddleware, async (req, res) => {
  try {
    const doc = await Skill.findOne({ user: req.user._id });
    res.json({ skills: doc || { user: req.user._id, techSkills: [], softSkills: [] } });
  } catch (err) {
    console.error('Get skills error:', err);
    res.status(500).json({ message: 'Server error fetching skills' });
  }
});

// Upsert skills for current user
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { techSkills = [], softSkills = [] } = req.body || {};

    const updated = await Skill.findOneAndUpdate(
      { user: req.user._id },
      { user: req.user._id, techSkills, softSkills },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    res.json({ message: 'Skills saved', skills: updated });
  } catch (err) {
    console.error('Save skills error:', err);
    res.status(500).json({ message: 'Server error saving skills' });
  }
});

module.exports = router;
