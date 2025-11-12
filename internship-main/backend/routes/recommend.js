const express = require('express');
const path = require('path');
const fs = require('fs');
const { parse } = require('csv-parse');
const { spawn } = require('child_process');
const auth = require('../middleware/auth');
const User = require('../models/User');
const Skill = require('../models/Skill');

const router = express.Router();

function callPython(sector, location, tech) {
    const runWith = (exe) => new Promise((resolve, reject) => {
        const scriptPath = path.resolve(__dirname, 'app.py');
        const args = [scriptPath, sector || '', location || '', tech || ''];
        const py = spawn(exe, args, { cwd: __dirname });
        let stdout = '';
        let stderr = '';
        py.stdout.on('data', (chunk) => { stdout += chunk.toString(); });
        py.stderr.on('data', (err) => { stderr += err.toString(); });
        py.on('error', (err) => reject(err));
        py.on('close', (code) => {
            if (code !== 0) return reject(new Error(`Python exited with code ${code}: ${stderr}`));
            try {
                const parsed = JSON.parse(stdout || '[]');
                resolve(parsed);
            } catch (e) {
                reject(new Error(`Failed to parse Python output: ${e.message}. Raw: ${stdout}`));
            }
        });
    });

    const candidates = [];
    if (process.env.PYTHON_EXEC) candidates.push(process.env.PYTHON_EXEC);
    if (process.platform === 'win32') {
        candidates.push('py');
        candidates.push('python');
    } else {
        candidates.push('python3');
        candidates.push('python');
    }

    return new Promise(async (resolve, reject) => {
        let lastErr = null;
        for (const exe of candidates) {
            try {
                const out = await runWith(exe);
                return resolve(out);
            } catch (e) {
                lastErr = e;
            }
        }
        reject(lastErr || new Error('No suitable Python executable found'));
    });
}

// Helpers (mirrors logic in internships CSV mapping)
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

const normalizeSkill = (s) => String(s || '')
    .toLowerCase()
    .replace(/[^a-z0-9+#.\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

const mapCsvRecordToInternship = (record, idx, { userSkillsSet } = {}) => {
    const durationMonths = parseInt(record.duration_months || '0', 10);
    const stipend = parseInt(record.stipend || '0', 10);
    const cities = (record.cities || '').split(',').map(c => c.trim().toLowerCase()).filter(Boolean);
    const location = (cities[0] || '').toLowerCase();
    const companyName = record.company || 'Company';
    const deadline = parseDMY(record.apply_by);
    const posted = parseDMY(record.posted_on);
    const applicationDeadlineISO = deadline ? deadline.toISOString() : new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString();
    const postedDaysAgo = posted ? daysBetween(posted, new Date()) : 3;
    const daysUntilDeadline = deadline ? daysBetween(new Date(), deadline) : null;

    // Basic skill match against title/type for visibility
    let matchPct = 75;
    let matchedSkills = [];
    if (userSkillsSet && userSkillsSet.size) {
        const hay = `${String(record.title || '')} ${String(record.type || '')}`.toLowerCase();
        const localMatches = [];
        for (const sk of userSkillsSet) {
            if (sk && hay.includes(sk)) localMatches.push(sk);
        }
        matchedSkills = localMatches;
        if (userSkillsSet.size > 0) {
            matchPct = Math.max(50, Math.min(98, Math.round((localMatches.length / userSkillsSet.size) * 100)));
        }
    }

    return {
        id: idx,
        title: record.title,
        // Keep company as a simple string for UI simplicity
        company: companyName,
        companyLogo: 'https://images.unsplash.com/photo-1551434678-e076c223a692?w=100&h=100&fit=crop&crop=center',
        sector: record.type || 'Technology',
        location,
        duration: durationMonths ? `${durationMonths} months` : (record.duration_months || '3 months'),
        stipend,
        applicationDeadline: applicationDeadlineISO,
        daysUntilDeadline,
        matchPercentage: typeof record.similarity === 'number' ? Math.round(record.similarity * 100) : matchPct,
        requiredSkills: [],
        qualifications: [],
        description: `${record.title} internship at ${companyName} in ${location}.`,
        aiReasoning: 'Matched based on your skills and preferences.',
        benefits: [],
        postedDaysAgo,
        isSaved: false,
        matchBreakdown: { matchedSkills }
    };
};

async function recommendInNode(sector, location, tech) {
    const filePath = path.resolve(__dirname, 'synthetic_internships.csv');
    const rows = [];
    const skills = String(tech || '')
        .split(',')
        .map(s => s.trim().toLowerCase())
        .filter(Boolean);
    const normalizedSkills = skills.map(normalizeSkill).filter(Boolean);
    const userSkillsSet = new Set(normalizedSkills);
    const sectorLower = String(sector || '').toLowerCase();
    const locationLower = String(location || '').toLowerCase();

    // Stream CSV
    await new Promise((resolve, reject) => {
        try {
            const parser = fs.createReadStream(filePath)
                .pipe(parse({ columns: true, skip_empty_lines: true, trim: true }));

            parser.on('data', (record) => {
                // Score each record
                const title = String(record.title || '').toLowerCase();
                const type = String(record.type || '').toLowerCase();
                const cities = String(record.cities || '')
                    .split(',').map(s => s.trim().toLowerCase()).filter(Boolean);

                let score = 0;
                if (sectorLower && (type.includes(sectorLower) || title.includes(sectorLower))) score += 30;
                if (locationLower && (cities.includes(locationLower) || title.includes(locationLower))) score += 25;
                // Skill-based signal
                if (normalizedSkills.length) {
                    let skillHits = 0;
                    for (const sk of normalizedSkills) {
                        if (!sk) continue;
                        if (title.includes(sk) || type.includes(sk)) skillHits += 1;
                    }
                    score += skillHits * 10; // weight per matching skill
                }
                // Light recency bias using posted_on if present
                const posted = parseDMY(record.posted_on);
                if (posted) {
                    const daysOld = daysBetween(posted, new Date());
                    if (daysOld <= 7) score += 10; else if (daysOld <= 30) score += 5;
                }

                rows.push({ record, score });
            });
            parser.on('end', resolve);
            parser.on('error', reject);
        } catch (e) {
            reject(e);
        }
    });

    // If no filters provided, give a sensible default ordering by stipend then recency
    if (!sectorLower && !locationLower && skills.length === 0) {
        for (const r of rows) {
            const stipend = parseInt(r.record.stipend || '0', 10);
            r.score = stipend / 1000; // mild influence
        }
    }

    rows.sort((a, b) => b.score - a.score);
    const top = rows.slice(0, 10);
    // Normalize output shape
    return top.map((x, idx) => {
        const mapped = mapCsvRecordToInternship(x.record, idx + 1, { userSkillsSet });
        // Scale score to ~match percent if we have one
        const maxScore = rows.length && rows[0].score ? rows[0].score : 1;
        const pct = Math.max(50, Math.min(98, Math.round((x.score / (maxScore || 1)) * 100)));
        // Blend with skill-based percentage if available
        if (mapped && typeof mapped.matchPercentage === 'number') {
            mapped.matchPercentage = Math.round((mapped.matchPercentage * 0.6) + (pct * 0.4));
        } else {
            mapped.matchPercentage = pct;
        }
        return mapped;
    });
}

// POST /api/recommendations
router.post('/', auth, async (req, res) => {
    const body = req.body || {};
    let sector = '';
    let location = '';
    let tech = '';

    // Normalize incoming parameters from multiple possible shapes
    try {
        if (typeof body.sector === 'string') sector = body.sector;
        if (!sector && Array.isArray(body.sectors) && body.sectors.length) {
            sector = String(body.sectors[0] ?? '');
        }

        if (typeof body.location === 'string') location = body.location;
        if (!location && Array.isArray(body.locations) && body.locations.length) {
            location = String(body.locations[0] ?? '');
        }

        if (typeof body.tech === 'string') tech = body.tech;
        if (!tech && Array.isArray(body.skills)) {
            tech = body.skills.filter(Boolean).join(', ');
        }
    } catch {}

    // Optional: also accept query params as fallback
    if (!sector && typeof req.query?.sector === 'string') sector = req.query.sector;
    if (!location && typeof req.query?.location === 'string') location = req.query.location;
    if (!tech && typeof req.query?.tech === 'string') tech = req.query.tech;
    try {
        // If any inputs missing, hydrate from DB for current user
                if (!sector || !location || !tech) {
            const user = await User.findById(req.user._id).select('profile');
            let skillsDoc = null;
            try { skillsDoc = await Skill.findOne({ user: req.user._id }); } catch {}

            if (!sector) sector = user?.profile?.sector || '';
            if (!location) location = user?.profile?.location || '';

            if (!tech) {
                const techArr = Array.isArray(skillsDoc?.techSkills) ? skillsDoc.techSkills
                  : (Array.isArray(user?.profile?.skills) ? user.profile.skills : []);
                tech = techArr.join(', ');
            }
        }

        let recommendations = [];
        let pythonTried = false;
        // Try Python recommender unless disabled
        if (process.env.USE_PY_RECOMMENDER !== 'false') {
            pythonTried = true;
            try {
                const pyRes = await callPython(sector, location, tech);
                // If python returns raw CSV-like records, map them to UI shape
                if (Array.isArray(pyRes) && pyRes.length) {
                    recommendations = pyRes.map((rec, idx) => {
                        // If already normalized, pass through
                        if (rec && rec.company && rec.title && rec.applicationDeadline) {
                            return rec;
                        }
                        const mapped = mapCsvRecordToInternship(rec, idx + 1);
                        if (typeof rec.similarity === 'number') {
                            mapped.matchPercentage = Math.round(rec.similarity * 100);
                        }
                        return mapped;
                    });
                }
            } catch (e) {
                console.warn('Python recommender failed, falling back to Node:', e.message);
            }
        }

        // Fallback to Node-based recommender if needed
        if (!Array.isArray(recommendations) || recommendations.length === 0) {
            recommendations = await recommendInNode(sector, location, tech);
        }

        res.json({ message: 'Recommendations generated', recommendations });
    } catch (err) {
        console.error('Recommend error:', err);
        res.status(500).json({ error: 'Failed to get recommendations', details: err.message });
    }
});

module.exports = router;