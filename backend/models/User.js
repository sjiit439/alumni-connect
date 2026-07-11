const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    fullName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['student', 'alumni'], required: true },
    
    // Academic details
    department: { type: String, required: true },
    batchYear: { type: String, required: true }, // Passout year or current batch
    
    // Alumni-specific fields
    company: { type: String, default: '' },
    designation: { type: String, default: '' },
    linkedinUrl: { type: String, default: '' },
    
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', UserSchema);