const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const authRoutes = require('./routes/auth');

const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// Serve static frontend files (HTML, CSS, JS) from the frontend directory
app.use(express.static(path.join(__dirname, '../frontend')));

// API Routes
app.use('/api/auth', authRoutes);

// Fallback route using Express v5 splat syntax
app.get('/{*splat}', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

// MongoDB Connection & Server Startup
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/ravenshaw_alumni';
const PORT = process.env.PORT || 5000;

mongoose.connect(MONGO_URI)
    .then(() => {
        console.log(' Connected to MongoDB Database');
        app.listen(PORT, () => console.log(` Server running on http://localhost:${PORT}`));
    })
    .catch(err => console.error(' Database Connection Error:', err));