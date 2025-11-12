const express = require('express');
const fs = require('fs');
const path = require('path');
const { parse } = require('csv-parse');
const Internship = require('../models/Internship');
const authMiddleware = require('../middleware/auth');

// Helpers for CSV mapping
const parseDMY = (str) => {
  if (!str || typeof str !== 'string') return null;
  const parts = str.split('-');
  if (parts.length !== 3) return null;
  const [dd, mm, yyyy] = parts;
  const iso = `${yyyy}-${String(mm).padStart(2,'0')}-${String(dd).padStart(2,'0')}T00:00:00Z`;
  const d = new Date(iso);
  return isNaN(d.getTime()) ? null : d;
};

const daysBetween = (d1, d2) => {
  const ms = d2.getTime() - d1.getTime();
  return Math.max(0, Math.ceil(ms / (1000 * 60 * 60 * 24)));
};

const mapCsvRecordToInternship = (record, idx) => {
  const durationMonths = parseInt(record.duration_months || '0', 10);
  const stipend = parseInt(record.stipend || '0', 10);
  const cities = (record.cities || '').split(',').map(c => c.trim()).filter(Boolean);
  const location = cities[0] || '';
  const companyName = record.company || 'Company';
  const deadline = parseDMY(record.apply_by);
  const posted = parseDMY(record.posted_on);
  const applicationDeadlineISO = deadline ? deadline.toISOString() : new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString();
  const postedDaysAgo = posted ? daysBetween(posted, new Date()) : 3;

  return {
    id: idx,
    title: record.title,
    company: {
      name: companyName,
      logo: 'https://images.unsplash.com/photo-1551434678-e076c223a692?w=100&h=100&fit=crop&crop=center',
      rating: 4.2,
      reviewCount: 100,
      size: '100-500',
      industry: record.type || 'Technology',
      description: `${companyName} is a leading organization.`
    },
    location,
    duration: durationMonths ? `${durationMonths} months` : (record.duration_months || '3 months'),
    stipend,
    applicationDeadline: applicationDeadlineISO,
    matchPercentage: 75,
    requiredSkills: [],
    qualifications: [],
    description: `${record.title} internship at ${companyName} in ${location}.`,
    aiReasoning: 'Matched based on your skills and preferences.',
    benefits: [],
    postedDaysAgo,
    isSaved: false,
  };
};

const router = express.Router();

// Get All Internships
router.get('/', async (req, res) => {
  try {
    const internships = await Internship.find().sort({ createdAt: -1 });
    res.json({
      internships,
      count: internships.length
    });

  } catch (error) {
    console.error('Get internships error:', error);
    res.status(500).json({ message: 'Server error fetching internships' });
  }
});

// Get internships from CSV (discover feed)
router.get('/discover', async (req, res) => {
  const filePath = path.resolve(__dirname, 'synthetic_internships.csv');
  const rows = [];
  try {
    const parser = fs.createReadStream(filePath).pipe(parse({ columns: true, skip_empty_lines: true, trim: true }));
    let idx = 1;
    for await (const record of parser) {
      rows.push(mapCsvRecordToInternship(record, idx++));
    }
    res.json({ internships: rows, count: rows.length });
  } catch (err) {
    console.error('CSV internships error:', err);
    res.status(500).json({ message: 'Failed to load internships from CSV' });
  }
});

// Support fetching by numeric id from CSV as a fallback
router.get('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    // If numeric, serve from CSV (our discover feed uses numeric IDs)
    if (/^\d+$/.test(id)) {
      const target = parseInt(id, 10);
      const filePath = path.resolve(__dirname, 'synthetic_internships.csv');
      const parser = fs.createReadStream(filePath).pipe(parse({ columns: true, skip_empty_lines: true, trim: true }));
      let idx = 1;
      for await (const record of parser) {
        if (idx === target) {
          const internship = mapCsvRecordToInternship(record, idx);
          return res.json({ internship });
        }
        idx++;
      }
      return res.status(404).json({ message: 'Internship not found' });
    }

    // Otherwise, use MongoDB by ObjectId
    const internship = await Internship.findById(id);
    if (!internship) {
      return res.status(404).json({ message: 'Internship not found' });
    }
    res.json({ internship });
  } catch (error) {
    console.error('Get internship error:', error);
    res.status(500).json({ message: 'Server error fetching internship' });
  }
});

// Create Internship (Protected route)
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { title, sector, skills, location, description, company, duration } = req.body;

    if (!title || !sector || !skills || !location || !description) {
      return res.status(400).json({ message: 'Please provide all required fields' });
    }

    const internship = new Internship({
      title,
      sector,
      skills: Array.isArray(skills) ? skills : [skills],
      location,
      description,
      company: company || 'Company Name',
      duration: duration || '3 months'
    });

    await internship.save();

    res.status(201).json({
      message: 'Internship created successfully',
      internship
    });

  } catch (error) {
    console.error('Create internship error:', error);
    res.status(500).json({ message: 'Server error creating internship' });
  }
});

// Seed some sample internships (for testing)
router.post('/seed', async (req, res) => {
  try {
    const sampleInternships = [
      {
        title: 'Frontend Developer Intern',
        sector: 'Technology',
        skills: ['React', 'JavaScript', 'HTML', 'CSS'],
        location: 'Mumbai',
        description: 'Work on modern web applications using React and JavaScript.',
        company: 'Tech Solutions Inc',
        duration: '3 months'
      },
      {
        title: 'Marketing Intern',
        sector: 'Marketing',
        skills: ['Digital Marketing', 'Social Media', 'Content Creation'],
        location: 'Delhi',
        description: 'Assist in digital marketing campaigns and social media management.',
        company: 'Creative Marketing Agency',
        duration: '4 months'
      },
      {
        title: 'Data Science Intern',
        sector: 'Technology',
        skills: ['Python', 'Machine Learning', 'Data Analysis', 'SQL'],
        location: 'Bangalore',
        description: 'Work on data analysis and machine learning projects.',
        company: 'DataTech Solutions',
        duration: '6 months'
      }
    ];

    await Internship.deleteMany({});
    const internships = await Internship.insertMany(sampleInternships);

    res.json({
      message: 'Sample internships created successfully',
      internships
    });

  } catch (error) {
    console.error('Seed internships error:', error);
    res.status(500).json({ message: 'Server error seeding internships' });
  }
});

module.exports = router;
