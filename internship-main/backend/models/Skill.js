const mongoose = require('mongoose');

const skillSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
    unique: true,
  },
  techSkills: [{ type: String, trim: true }],
  softSkills: [{ type: String, trim: true }],
}, { timestamps: true });

module.exports = mongoose.model('Skill', skillSchema);
