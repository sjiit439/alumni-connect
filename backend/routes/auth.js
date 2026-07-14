const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'ravenshaw_prototype_secret_123';

const DATA_DIR = path.resolve(__dirname, '../data');
const STUDENTS_FILE = path.join(DATA_DIR, 'students.json');
const ALUMNI_FILE = path.join(DATA_DIR, 'alumni.json');

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

// REGISTER USER
router.post('/register', async (req, res) => {
    try {
        const { fullName, email, password, role, department, course, batchYear } = req.body;

        if (!fullName || !email || !password || !role || !department || !course || !batchYear) {
            return res.status(400).json({ message: 'Please fill in all required fields.' });
        }

        const cleanEmail = email.trim().toLowerCase();
        const students = readFile(STUDENTS_FILE);
        const alumni = readFile(ALUMNI_FILE);

        // Check for duplicate email across both student and alumni files
        const emailExists = students.some(u => u.email.toLowerCase() === cleanEmail) ||
                            alumni.some(u => u.email.toLowerCase() === cleanEmail);

        if (emailExists) {
            return res.status(400).json({ message: 'This Email / Gmail is already registered. Please log in.' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Base user object
        const newUser = {
            id: (role === 'alumni' ? 'alm_' : 'std_') + Date.now(),
            fullName: fullName.trim(),
            email: cleanEmail,
            password: hashedPassword,
            role,
            department,
            course,
            batchYear: batchYear.toString().trim(), // Enforce String data type
            createdAt: new Date().toISOString()
        };

        // Add professional fields ONLY if the user is an alumnus
        if (role === 'alumni') {
            newUser.company = req.body.company ? req.body.company.trim() : '';
            newUser.designation = req.body.designation ? req.body.designation.trim() : '';
            newUser.linkedinUrl = req.body.linkedinUrl ? req.body.linkedinUrl.trim() : '';
        }

        const targetFile = role === 'alumni' ? ALUMNI_FILE : STUDENTS_FILE;
        const targetList = role === 'alumni' ? alumni : students;

        targetList.push(newUser);
        writeFile(targetFile, targetList);

        res.status(201).json({ message: 'Registration successful! Redirecting to login...' });
    } catch (err) {
        res.status(500).json({ message: 'Server error during registration.' });
    }
});

// LOGIN USER
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const cleanEmail = email.trim().toLowerCase();

        const students = readFile(STUDENTS_FILE);
        const alumni = readFile(ALUMNI_FILE);

        const user = students.find(u => u.email.toLowerCase() === cleanEmail) ||
                     alumni.find(u => u.email.toLowerCase() === cleanEmail);

        if (!user) {
            return res.status(400).json({ message: 'Account not found with this email.' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid Email or Password.' });
        }

        const token = jwt.sign(
            { id: user.id, role: user.role, name: user.fullName },
            JWT_SECRET,
            { expiresIn: '1d' }
        );

        res.json({
            token,
            user: {
                id: user.id,
                fullName: user.fullName,
                email: user.email,
                role: user.role,
                department: user.department,
                course: user.course,
                batchYear: user.batchYear,
                company: user.company || '',
                designation: user.designation || ''
            }
        });
    } catch (err) {
        res.status(500).json({ message: 'Server error during login.' });
    }
});

module.exports = router;