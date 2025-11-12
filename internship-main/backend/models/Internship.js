const mongoose = require('mongoose');

const internshipSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  sector: {
    type: String,
    required: true,
    trim: true
  },
  skills: [{
    type: String,
    required: true,
    trim: true
  }],
  location: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  company: {
    type: String,
    default: 'Company Name'
  },
  duration: {
    type: String,
    default: '3 months'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Internship', internshipSchema);
