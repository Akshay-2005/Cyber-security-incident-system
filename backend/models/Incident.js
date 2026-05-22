const mongoose = require('mongoose');

const IncidentSchema = new mongoose.Schema({
    incidentName: {
        type: String,
        required: [true, 'Incident Name is required'],
        trim: true
    },
    threatType: {
        type: String,
        required: [true, 'Threat Type is required'],
        enum: ['Malware Attack', 'DDoS Traffic Spike', 'Suspicious Login Attempt', 'Ransomware Payload', 'Phishing Email Attack'],
        default: 'Malware Attack'
    },
    severity: {
        type: String,
        required: [true, 'Severity is required'],
        enum: ['Low', 'Medium', 'High'],
        default: 'Low'
    },
    priority: {
        type: String,
        required: [true, 'Priority is required'],
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
    assignedAnalyst: {
        type: String,
        required: [true, 'Assigned Analyst name is required'],
        trim: true
    },
    status: {
        type: String,
        required: [true, 'Status is required'],
        enum: ['New', 'In Progress', 'Resolved', 'Closed'],
        default: 'New'
    },
    resolutionNotes: {
        type: String,
        default: ''
    },
    salesforceId: {
        type: String,
        default: null // Will hold Salesforce record ID if successfully synced
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

IncidentSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    next();
});

module.exports = mongoose.model('Incident', IncidentSchema);
