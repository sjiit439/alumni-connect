const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const JWT_SECRET = process.env.JWT_SECRET || 'ravenshaw_secret_key_123';

// 1. REGISTER USER
router.post('/register', async (req, res) => {
    try {
        const { fullName, email, password, role, department, batchYear, company, designation, linkedinUrl } = req.body;

        // Check if user already exists
        let user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({ message: 'User with this email already exists' });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create user record
        user = new User({
            fullName,
            email,
            password: hashedPassword,
            role,
            department,
            batchYear,
            company: role === 'alumni' ? company : '',
            designation: role === 'alumni' ? designation : '',
            linkedinUrl: role === 'alumni' ? linkedinUrl : ''
        });

        await user.save();
        res.status(201).json({ message: 'Registration successful! Please login.' });

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error during registration' });
    }
});

// 2. LOGIN USER
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Find user by email
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: 'Invalid Email or Password' });
        }

        // Verify password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid Email or Password' });
        }

        // Create JWT Token
        const token = jwt.sign(
            { id: user._id, role: user.role, name: user.fullName },
            JWT_SECRET,
            { expiresIn: '1d' }
        );

        // Send back user details (excluding password)
        res.json({
            token,
            user: {
                id: user._id,
                fullName: user.fullName,
                email: user.email,
                role: user.role,
                department: user.department,
                batchYear: user.batchYear,
                company: user.company,
                designation: user.designation
            }
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error during login' });
    }
});

module.exports = router;