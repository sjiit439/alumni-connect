const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');

const DATA_DIR = path.resolve(__dirname, '../data');
const ALUMNI_FILE = path.join(DATA_DIR, 'alumni.json');
const JOBS_FILE = path.join(DATA_DIR, 'jobs.json');

const readFile = (filePath) => {
    try {
        return JSON.parse(fs.readFileSync(filePath, 'utf-8') || '[]');
    } catch (err) {
        return [];
    }
};

const writeFile = (filePath, data) => {
    try {
        fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
        return true;
    } catch (err) {
        return false;
    }
};

// GET ALUMNI DIRECTORY
router.get('/alumni', (req, res) => {
    res.json(readFile(ALUMNI_FILE));
});

// GET POSTED JOBS
router.get('/jobs', (req, res) => {
    res.json(readFile(JOBS_FILE));
});

// POST A NEW OPPORTUNITY
router.post('/jobs', (req, res) => {
    const jobs = readFile(JOBS_FILE);
    const newOpportunity = {
        id: 'opp_' + Date.now(),
        ...req.body,
        createdAt: new Date().toLocaleDateString()
    };

    jobs.unshift(newOpportunity);
    writeFile(JOBS_FILE, jobs);

    res.status(201).json({ message: 'Opportunity posted successfully!' });
});

module.exports = router;