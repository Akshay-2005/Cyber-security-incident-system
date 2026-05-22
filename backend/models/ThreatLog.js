const mongoose = require('mongoose');

const ThreatLogSchema = new mongoose.Schema({
    threatLogName: {
        type: String,
        required: [true, 'Threat Log Name is required'],
        trim: true
    },
    threatType: {
        type: String,
        required: [true, 'Threat Type is required'],
        enum: ['Malware Attack', 'DDoS Traffic Spike', 'Suspicious Login Attempt', 'Ransomware Payload', 'Phishing Email Attack'],
        default: 'Malware Attack'
    },
    threatLevel: {
        type: String,
        required: [true, 'Threat Level is required'],
        enum: ['Low', 'Medium', 'High'],
        default: 'Low'
    },
    sourceIp: {
        type: String,
        required: [true, 'Source IP is required'],
        trim: true
    },
    destinationIp: {
        type: String,
        required: [true, 'Destination IP is required'],
        trim: true
    },
    linkedIncident: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Incident',
        default: null // Optional link to a parent investigated incident
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

module.exports = mongoose.model('ThreatLog', ThreatLogSchema);
