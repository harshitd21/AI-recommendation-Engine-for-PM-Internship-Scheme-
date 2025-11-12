const express = require('express');
const Application = require('../models/Application');
const auth = require('../middleware/auth');

const router = express.Router();

// Helper to build a deterministic sourceKey for de-duplication
const buildSourceKey = ({ title, company, location }) => {
  const t = (title || '').trim().toLowerCase();
  const c = (company || '').trim().toLowerCase();
  const l = (location || '').trim().toLowerCase();
  if (!t || !c) return undefined;
  return `${t}::${c}::${l}`;
};

// GET /api/applications - list current user's applications
router.get('/', auth, async (req, res) => {
  try {
    const apps = await Application.find({ user: req.user.id }).sort({ updatedAt: -1 });
    res.json({ applications: apps });
  } catch (err) {
    console.error('List applications error:', err);
    res.status(500).json({ message: 'Failed to fetch applications' });
  }
});

// POST /api/applications/upsert - create or update by sourceKey
router.post('/upsert', auth, async (req, res) => {
  try {
    const {
      title,
      company,
      location,
      duration,
      stipend,
      applicationDeadline,
      description,
      status,
      sourceType,
      sourceId,
    } = req.body || {};

    if (!title || !company) {
      return res.status(400).json({ message: 'title and company are required' });
    }

    const sourceKey = buildSourceKey({ title, company, location });
    const update = {
      user: req.user.id,
      title,
      company,
      location,
      duration,
      stipend: typeof stipend === 'number' ? stipend : 0,
      applicationDeadline: applicationDeadline ? new Date(applicationDeadline) : undefined,
      description,
      status: status || 'applied',
      deadline: applicationDeadline ? new Date(applicationDeadline) : undefined,
      sourceType: sourceType || 'manual',
      sourceId,
      sourceKey,
    };

    const app = await Application.findOneAndUpdate(
      { user: req.user.id, ...(sourceKey ? { sourceKey } : { _id: null }) },
      { $set: update, $setOnInsert: { appliedDate: new Date() } },
      { upsert: true, new: true }
    );

    res.json({ application: app });
  } catch (err) {
    console.error('Upsert application error:', err);
    // Handle duplicate key gracefully
    if (err.code === 11000) {
      try {
        const { title, company, location } = req.body || {};
        const sourceKey = buildSourceKey({ title, company, location });
        const app = await Application.findOne({ user: req.user.id, sourceKey });
        if (app) return res.json({ application: app });
      } catch {}
    }
    res.status(500).json({ message: 'Failed to upsert application' });
  }
});

// PATCH /api/applications/:id - update status or other fields
router.patch('/:id', auth, async (req, res) => {
  try {
    const updates = {};
    const allowed = ['status', 'priority', 'interviewDate', 'followUpDate', 'notes'];
    for (const key of allowed) {
      if (key in req.body) updates[key] = req.body[key];
    }
    const app = await Application.findOneAndUpdate(
      { _id: req.params.id, user: req.user.id },
      { $set: updates },
      { new: true }
    );
    if (!app) return res.status(404).json({ message: 'Application not found' });
    res.json({ application: app });
  } catch (err) {
    console.error('Update application error:', err);
    res.status(500).json({ message: 'Failed to update application' });
  }
});

module.exports = router;

// Additional dashboard-friendly endpoints

// GET /api/applications/recent-activity - latest actions/events
router.get('/recent-activity', auth, async (req, res) => {
  try {
    const apps = await Application.find({ user: req.user.id })
      .sort({ updatedAt: -1 })
      .limit(20)
      .lean();

    const activities = [];
    for (const app of apps) {
      // status update as activity
      activities.push({
        id: `${app._id}-status`,
        type: app.status === 'offer_received' ? 'offer' : (app.status === 'rejected' ? 'rejection' : (app.status === 'interview_scheduled' ? 'interview' : 'application')),
        message: `${app.title} at ${app.company} • ${app.status.replace(/_/g, ' ')}`,
        timestamp: app.updatedAt,
      });

      // recent notes as activity (latest 1)
      if (Array.isArray(app.notes) && app.notes.length) {
        const lastNote = app.notes[app.notes.length - 1];
        activities.push({
          id: `${app._id}-note-${app.notes.length}`,
          type: 'application',
          message: `Note added to ${app.title}: ${lastNote.content.slice(0, 80)}`,
          timestamp: lastNote.date || app.updatedAt,
        });
      }
    }
    // Sort combined by time desc and trim
    activities.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    res.json({ activities: activities.slice(0, 20) });
  } catch (err) {
    console.error('Recent activity error:', err);
    res.status(500).json({ message: 'Failed to fetch recent activity' });
  }
});

// GET /api/applications/upcoming-deadlines - next application/interview/follow-ups
router.get('/upcoming-deadlines', auth, async (req, res) => {
  try {
    const apps = await Application.find({ user: req.user.id }).lean();
    const now = new Date();
    const deadlines = [];

    for (const app of apps) {
      if (app.applicationDeadline) {
        deadlines.push({
          id: `${app._id}-apply`,
          type: 'application',
          title: `${app.title} application due`,
          company: app.company,
          date: app.applicationDeadline,
        });
      }
      if (app.interviewDate) {
        deadlines.push({
          id: `${app._id}-interview`,
          type: 'interview',
          title: `${app.title} interview`,
          company: app.company,
          date: app.interviewDate,
        });
      }
      if (app.followUpDate) {
        deadlines.push({
          id: `${app._id}-follow`,
          type: 'follow_up',
          title: `${app.title} follow-up`,
          company: app.company,
          date: app.followUpDate,
        });
      }
    }

    // future first, then closest
    const upcoming = deadlines
      .filter(d => new Date(d.date) >= now)
      .sort((a, b) => new Date(a.date) - new Date(b.date))
      .slice(0, 20);

    res.json({ deadlines: upcoming });
  } catch (err) {
    console.error('Upcoming deadlines error:', err);
    res.status(500).json({ message: 'Failed to fetch upcoming deadlines' });
  }
});
