const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const authRoutes = require('./routes/auth');

const app = express();

// 1. Enable CORS & JSON Request Parsing
app.use(cors());
app.use(express.json());

// 2. Serve Frontend Files Statically
app.use(express.static(path.join(__dirname, '../frontend')));

// 3. API Routes
app.use('/api/auth', authRoutes);

// 4. Catch-all fallback route
app.get('/{*splat}', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

// MongoDB Connection & Server Start
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/ravenshaw_alumni';
const PORT = process.env.PORT || 5000;

mongoose.connect(MONGO_URI)
    .then(() => {
        console.log(' Connected to MongoDB Database');
        app.listen(PORT, () => console.log(` Server running on http://localhost:${PORT}`));
    })
    .catch(err => console.error(' Database Connection Error:', err));