const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');

const DATA_DIR = path.resolve(__dirname, '../data');
const ALUMNI_FILE = path.join(DATA_DIR, 'alumni.json');
const JOBS_FILE = path.join(DATA_DIR, 'jobs.json');

const ensureStorage = () => {
    if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
    if (!fs.existsSync(ALUMNI_FILE)) fs.writeFileSync(ALUMNI_FILE, JSON.stringify([], null, 2));
    if (!fs.existsSync(JOBS_FILE)) fs.writeFileSync(JOBS_FILE, JSON.stringify([], null, 2));
};

const readFile = (filePath) => {
    ensureStorage();
    try {
        return JSON.parse(fs.readFileSync(filePath, 'utf-8') || '[]');
    } catch (err) {
        return [];
    }
};

const writeFile = (filePath, data) => {
    ensureStorage();
    try {
        fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
        return true;
    } catch (err) {
        return false;
    }
};

// GET ALUMNI DIRECTORY
router.get('/alumni', (req, res) => {
    const alumniList = readFile(ALUMNI_FILE).map(a => ({
        id: a.id,
        fullName: a.fullName,
        email: a.email,
        department: a.department,
        batchYear: a.batchYear,
        company: a.company,
        designation: a.designation,
        linkedinUrl: a.linkedinUrl
    }));
    res.json(alumniList);
});

// GET POSTED JOBS
router.get('/jobs', (req, res) => {
    const jobs = readFile(JOBS_FILE);
    res.json(jobs);
});

// POST A NEW JOB / INTERNSHIP
router.post('/jobs', (req, res) => {
    const { title, company, type, location, description, applyLink, postedBy } = req.body;

    if (!title || !company || !type || !description) {
        return res.status(400).json({ message: 'Please complete required job details.' });
    }

    const jobs = readFile(JOBS_FILE);
    const newJob = {
        id: 'job_' + Date.now(),
        title,
        company,
        type, // 'Job' or 'Internship'
        location: location || 'Remote',
        description,
        applyLink: applyLink || '#',
        postedBy: postedBy || 'Alumnus',
        createdAt: new Date().toLocaleDateString()
    };

    jobs.unshift(newJob);
    writeFile(JOBS_FILE, jobs);

    res.status(201).json({ message: 'Opportunity posted successfully!' });
});

module.exports = router;