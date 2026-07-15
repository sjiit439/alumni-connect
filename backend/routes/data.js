const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');

const DATA_DIR = path.resolve(__dirname, '../data');
const ALUMNI_FILE = path.join(DATA_DIR, 'alumni.json');
const STUDENTS_FILE = path.join(DATA_DIR, 'students.json');
const JOBS_FILE = path.join(DATA_DIR, 'jobs.json');
const EVENTS_FILE = path.join(DATA_DIR, 'events.json');

const ensureStorage = () => {
    if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
    if (!fs.existsSync(ALUMNI_FILE)) fs.writeFileSync(ALUMNI_FILE, JSON.stringify([], null, 2));
    if (!fs.existsSync(STUDENTS_FILE)) fs.writeFileSync(STUDENTS_FILE, JSON.stringify([], null, 2));
    if (!fs.existsSync(JOBS_FILE)) fs.writeFileSync(JOBS_FILE, JSON.stringify([], null, 2));
    if (!fs.existsSync(EVENTS_FILE)) fs.writeFileSync(EVENTS_FILE, JSON.stringify([], null, 2));
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

// --- DIRECTORY & JOBS ---
router.get('/alumni', (req, res) => res.json(readFile(ALUMNI_FILE)));
router.get('/jobs', (req, res) => res.json(readFile(JOBS_FILE)));

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

// --- MENTORSHIP REQUESTS (FEATURE 1) ---
router.post('/mentorship', (req, res) => {
    const { studentEmail, alumniId, alumniName, topic, message } = req.body;

    if (!studentEmail || !alumniId || !topic || !message) {
        return res.status(400).json({ message: 'Please complete all mentorship fields.' });
    }

    const students = readFile(STUDENTS_FILE);
    const studentIndex = students.findIndex(s => s.email.toLowerCase() === studentEmail.trim().toLowerCase());

    if (studentIndex === -1) {
        return res.status(404).json({ message: 'Student account not found.' });
    }

    if (!students[studentIndex].mentorshipRequests) {
        students[studentIndex].mentorshipRequests = [];
    }

    const newRequest = {
        requestId: 'req_' + Date.now(),
        alumniId,
        alumniName,
        topic,
        message,
        status: 'Sent (Pending Response)',
        sentAt: new Date().toLocaleDateString()
    };

    students[studentIndex].mentorshipRequests.unshift(newRequest);
    writeFile(STUDENTS_FILE, students);

    res.status(201).json({ message: 'Mentorship request sent successfully!' });
});

// GET STUDENT MENTORSHIP REQUESTS
router.get('/mentorship/:email', (req, res) => {
    const email = req.params.email.toLowerCase();
    const students = readFile(STUDENTS_FILE);
    const student = students.find(s => s.email.toLowerCase() === email);

    if (!student) {
        return res.json([]);
    }

    res.json(student.mentorshipRequests || []);
});

// --- EVENTS, WEBINARS & NEWS (FEATURE 4) ---
router.get('/events', (req, res) => {
    res.json(readFile(EVENTS_FILE));
});

router.post('/events', (req, res) => {
    const { type, title, category, department, eventDate, speaker, meetingLink, description, postedBy } = req.body;

    if (!title || !description || !type) {
        return res.status(400).json({ message: 'Title, Type and Description are required.' });
    }

    const events = readFile(EVENTS_FILE);
    const newEvent = {
        id: (type === 'Webinar' ? 'evt_' : 'news_') + Date.now(),
        type,
        title,
        category: category || 'General',
        department: department || 'All Departments',
        eventDate: eventDate || '',
        speaker: speaker || postedBy || 'Ravenshaw Faculty',
        meetingLink: meetingLink || '#',
        description,
        rsvps: 0,
        createdAt: new Date().toLocaleDateString()
    };

    events.unshift(newEvent);
    writeFile(EVENTS_FILE, events);

    res.status(201).json({ message: `${type} published successfully!` });
});

// EVENT RSVP COUNTER
router.post('/events/:id/rsvp', (req, res) => {
    const { id } = req.params;
    const events = readFile(EVENTS_FILE);
    const event = events.find(e => e.id === id);

    if (event) {
        event.rsvps = (event.rsvps || 0) + 1;
        writeFile(EVENTS_FILE, events);
        return res.json({ message: 'RSVP confirmed!', rsvps: event.rsvps });
    }

    res.status(404).json({ message: 'Event not found.' });
});

module.exports = router;