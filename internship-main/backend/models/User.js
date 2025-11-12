const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  hasOnboarded: {
    type: Boolean,
    default: true
  },
  profile: {
    education: {
      type: String,
      default: ''
    },
    skills: [{
      type: String,
      trim: true
    }],
    sector: {
      type: String,
      default: ''
    },
    location: {
      type: String,
      default: ''
    }
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('User', userSchema);
