const mongoose = require('mongoose');

const AnalystSchema = new mongoose.Schema({
    analystName: {
        type: String,
        required: [true, 'Analyst Name is required'],
        trim: true
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        trim: true
    },
    casesResolved: {
        type: Number,
        default: 0
    },
    averageResponseTime: {
        type: Number,
        default: 0.0 // Average hours taken per ticket
    },
    slaCompliance: {
        type: Number,
        default: 100.0 // Percentage score (e.g. 98.50%)
    },
    salesforceId: {
        type: String,
        default: null
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Analyst', AnalystSchema);
