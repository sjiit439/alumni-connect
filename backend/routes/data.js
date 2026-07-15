const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');

const DATA_DIR = path.resolve(__dirname, '../data');
const ALUMNI_FILE = path.join(DATA_DIR, 'alumni.json');
const STUDENTS_FILE = path.join(DATA_DIR, 'students.json');
const JOBS_FILE = path.join(DATA_DIR, 'jobs.json');
const EVENTS_FILE = path.join(DATA_DIR, 'events.json');

const readFile = (filePath) => {
    try { return JSON.parse(fs.readFileSync(filePath, 'utf-8') || '[]'); } 
    catch (err) { return []; }
};

const writeFile = (filePath, data) => {
    try { fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8'); return true; } 
    catch (err) { return false; }
};

// --- DIRECTORY & JOBS ---
router.get('/alumni', (req, res) => res.json(readFile(ALUMNI_FILE)));
router.get('/jobs', (req, res) => res.json(readFile(JOBS_FILE)));

router.post('/jobs', (req, res) => {
    const jobs = readFile(JOBS_FILE);
    const newOpportunity = { id: 'opp_' + Date.now(), ...req.body, createdAt: new Date().toLocaleDateString() };
    jobs.unshift(newOpportunity);
    writeFile(JOBS_FILE, jobs);
    res.status(201).json({ message: 'Opportunity posted successfully!' });
});

// --- MENTORSHIP SYSTEM ---

// 1. Post a Mentorship Request (Student -> Alumni)
router.post('/mentorship', (req, res) => {
    const { studentEmail, studentName, studentDept, studentCourse, alumniId, alumniName, topic, message } = req.body;

    if (!studentEmail || !alumniId || !topic || !message) {
        return res.status(400).json({ message: 'Please complete all mentorship fields.' });
    }

    const cleanEmail = studentEmail.trim().toLowerCase();
    const students = readFile(STUDENTS_FILE);
    
    // Find all records with this email (case-insensitive)
    const matchingStudents = students.filter(s => s.email.trim().toLowerCase() === cleanEmail);

    if (matchingStudents.length === 0) {
        return res.status(404).json({ message: 'Student account not found.' });
    }

    const newRequest = {
        requestId: 'req_' + Date.now(),
        studentName: studentName || matchingStudents[0].fullName,
        studentEmail: cleanEmail,
        studentDept: studentDept || matchingStudents[0].department || 'General',
        studentCourse: studentCourse || matchingStudents[0].course || 'Degree',
        alumniId,
        alumniName,
        topic,
        message,
        status: 'Pending',
        sentAt: new Date().toLocaleDateString()
    };

    // Update the mentorshipRequests array for ALL entries matching this email
    students.forEach(s => {
        if (s.email.trim().toLowerCase() === cleanEmail) {
            if (!s.mentorshipRequests) s.mentorshipRequests = [];
            s.mentorshipRequests.unshift(newRequest);
        }
    });

    writeFile(STUDENTS_FILE, students);
    console.log(`✅ Mentorship request written to students.json for ${cleanEmail}`);

    res.status(201).json({ message: 'Mentorship request sent successfully!' });
});

// 2. Get Requests Sent by a Student
router.get('/mentorship/:email', (req, res) => {
    const cleanEmail = decodeURIComponent(req.params.email).trim().toLowerCase();
    const students = readFile(STUDENTS_FILE);
    
    // Search across all student objects for matching requests
    const student = students.find(s => s.email.trim().toLowerCase() === cleanEmail && s.mentorshipRequests && s.mentorshipRequests.length > 0) 
                 || students.find(s => s.email.trim().toLowerCase() === cleanEmail);

    if (!student) {
        return res.json([]);
    }

    res.json(student.mentorshipRequests || []);
});

// 3. Get Requests Received by an Alumni
router.get('/mentorship/alumni/:identifier', (req, res) => {
    const identifier = decodeURIComponent(req.params.identifier).trim().toLowerCase();
    const students = readFile(STUDENTS_FILE);
    let receivedRequests = [];

    students.forEach(s => {
        if (s.mentorshipRequests && Array.isArray(s.mentorshipRequests)) {
            s.mentorshipRequests.forEach(req => {
                const matchId = req.alumniId && req.alumniId.toLowerCase() === identifier;
                const matchName = req.alumniName && req.alumniName.toLowerCase() === identifier;
                if (matchId || matchName) {
                    receivedRequests.push(req);
                }
            });
        }
    });

    res.json(receivedRequests);
});

// --- EVENTS & WEBINARS ---
router.get('/events', (req, res) => res.json(readFile(EVENTS_FILE)));

router.post('/events', (req, res) => {
    const { type, title, category, department, eventDate, speaker, meetingLink, description, postedBy } = req.body;
    const events = readFile(EVENTS_FILE);
    const newEvent = {
        id: (type === 'Webinar' ? 'evt_' : 'news_') + Date.now(),
        type, title, category: category || 'General',
        department: department || 'All Departments',
        eventDate: eventDate || '', speaker: speaker || postedBy || 'Ravenshaw Faculty',
        meetingLink: meetingLink || '#', description, rsvps: 0,
        createdAt: new Date().toLocaleDateString()
    };
    events.unshift(newEvent);
    writeFile(EVENTS_FILE, events);
    res.status(201).json({ message: `${type} published successfully!` });
});

router.post('/events/:id/rsvp', (req, res) => {
    const events = readFile(EVENTS_FILE);
    const event = events.find(e => e.id === req.params.id);
    if (event) {
        event.rsvps = (event.rsvps || 0) + 1;
        writeFile(EVENTS_FILE, events);
        return res.json({ message: 'RSVP confirmed!', rsvps: event.rsvps });
    }
    res.status(404).json({ message: 'Event not found.' });
});

module.exports = router;