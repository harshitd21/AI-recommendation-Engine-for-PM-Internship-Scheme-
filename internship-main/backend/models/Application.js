const mongoose = require('mongoose');

const NoteSchema = new mongoose.Schema({
  author: { type: String, default: 'You' },
  date: { type: Date, default: Date.now },
  content: { type: String, default: '' },
}, { _id: false });

const DocumentSchema = new mongoose.Schema({
  name: { type: String },
  size: { type: String },
  url: { type: String },
}, { _id: false });

const ApplicationSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  // Source tracking/dedup
  sourceType: { type: String, enum: ['csv', 'db', 'recommendation', 'manual'], default: 'manual' },
  sourceId: { type: String },
  sourceKey: { type: String, index: true },

  // Snapshot of internship
  title: { type: String, required: true },
  company: { type: String, required: true },
  location: { type: String },
  duration: { type: String },
  stipend: { type: Number, default: 0 },
  applicationDeadline: { type: Date },
  description: { type: String },

  // Tracker fields
  status: { 
    type: String, 
    enum: ['applied', 'under_review', 'interview_scheduled', 'offer_received', 'rejected'],
    default: 'applied'
  },
  priority: { type: String, enum: ['low', 'medium', 'high'], default: 'medium' },
  appliedDate: { type: Date, default: Date.now },
  deadline: { type: Date },
  interviewDate: { type: Date },
  followUpDate: { type: Date },

  notes: { type: [NoteSchema], default: [] },
  documents: { type: [DocumentSchema], default: [] },
}, { timestamps: true });

// Ensure uniqueness per user and sourceKey when provided
ApplicationSchema.index({ user: 1, sourceKey: 1 }, { unique: true, partialFilterExpression: { sourceKey: { $type: 'string' } } });

module.exports = mongoose.model('Application', ApplicationSchema);
