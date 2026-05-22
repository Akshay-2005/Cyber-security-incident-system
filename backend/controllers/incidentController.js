const Incident = require('../models/Incident');
const sfService = require('../services/salesforceService');
const emailService = require('../services/emailService');

// Simulates AI Threat Prediction scoring based on incident severity
const calculateAiThreatPrediction = (incident) => {
    let riskScore = 20;
    let classification = 'LOW RISK';
    let recommendations = [];

    if (incident.severity === 'High') {
        riskScore = 92;
        classification = 'HIGH RISK';
        recommendations = [
            'Immediate network isolation of infected subnet hosts.',
            'Deploy firewall rule blocking source IP address: ' + incident.sourceIp,
            'Initiate full kernel memory dump and endpoint trace on target: ' + incident.destinationIp,
            'Dispatch critical CIRT response unit and revoke affected session tokens.'
        ];
    } else if (incident.severity === 'Medium') {
        riskScore = 58;
        classification = 'MODERATE RISK';
        recommendations = [
            'Initiate behavioral scanning and enable debug level firewall audit trails.',
            'Quarantine suspicious files on targeted destination host: ' + incident.destinationIp,
            'Deploy credentials reset directives across flagged security domains.',
            'Cross-reference threat signature with active SIEM logs.'
        ];
    } else {
        riskScore = 18;
        classification = 'LOW RISK';
        recommendations = [
            'Log incident parameters in local database registries.',
            'Confirm target machine possesses latest software security patch updates.',
            'Flag originating IP ' + incident.sourceIp + ' in watchlist records.',
            'Observe traffic metrics for consecutive 48-hour period.'
        ];
    }

    return {
        riskScore,
        classification,
        recommendations,
        analysisTime: new Date()
    };
};

/**
 * Creates a new Cyber Incident
 */
exports.createIncident = async (req, res) => {
    try {
        const incident = new Incident(req.body);
        
        // Safe check: If priority is High, the trigger logic in Salesforce sets Status to New.
        // We replicate this rule locally for consistency!
        if (incident.priority === 'High') {
            incident.status = 'New';
        }

        // Save local MongoDB instance first
        await incident.save();

        // 1. If Severity is HIGH, automatically dispatch Nodemailer emergency email alert
        if (incident.severity === 'High') {
            // Trigger in the background
            emailService.sendEmergencyAlertEmail(incident).catch(err => 
                console.error('❌ [Incident Controller] Background email failure:', err)
            );
        }

        // 2. Synchronize to Salesforce custom object Cyber_Incident__c
        const sfId = await sfService.syncIncidentToSalesforce(incident);
        if (sfId) {
            incident.salesforceId = sfId;
            await incident.save();
        }

        return res.status(201).json({
            success: true,
            message: 'Incident registered and synchronized successfully',
            incident,
            aiPrediction: calculateAiThreatPrediction(incident)
        });
    } catch (error) {
        console.error('❌ [Incident Controller] Create Error:', error);
        return res.status(400).json({ success: false, message: 'Failed to create incident', error: error.message });
    }
};

/**
 * Retrieves list of incidents with advanced filters, text search, and pagination
 */
exports.getIncidents = async (req, res) => {
    try {
        const { search, status, severity, priority, threatType, page = 1, limit = 10 } = req.query;

        const query = {};

        // Status, Severity, Priority Picklist filters
        if (status) query.status = status;
        if (severity) query.severity = severity;
        if (priority) query.priority = priority;
        if (threatType) query.threatType = threatType;

        // Fuzzy Text Search
        if (search) {
            query.$or = [
                { incidentName: { $regex: search, $options: 'i' } },
                { sourceIp: { $regex: search, $options: 'i' } },
                { destinationIp: { $regex: search, $options: 'i' } },
                { assignedAnalyst: { $regex: search, $options: 'i' } }
            ];
        }

        // Pagination parameters
        const skip = (parseInt(page) - 1) * parseInt(limit);

        const total = await Incident.countDocuments(query);
        const incidents = await Incident.find(query)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit));

        return res.json({
            success: true,
            total,
            page: parseInt(page),
            pages: Math.ceil(total / parseInt(limit)),
            incidents
        });
    } catch (error) {
        console.error('❌ [Incident Controller] Query Error:', error);
        return res.status(500).json({ success: false, message: 'Server error retrieving incidents' });
    }
};

/**
 * Fetches details of a single incident and returns integrated AI Risk scoring
 */
exports.getIncidentById = async (req, res) => {
    try {
        const incident = await Incident.findById(req.params.id);
        if (!incident) {
            return res.status(404).json({ success: false, message: 'Incident not found' });
        }

        // Generate dynamic AI risk predictions
        const aiPrediction = calculateAiThreatPrediction(incident);

        return res.json({
            success: true,
            incident,
            aiPrediction
        });
    } catch (error) {
        console.error('❌ [Incident Controller] Fetch ID Error:', error);
        return res.status(500).json({ success: false, message: 'Server error fetching incident profile' });
    }
};

/**
 * Updates an existing incident record and syncs the changes to Salesforce
 */
exports.updateIncident = async (req, res) => {
    try {
        const incident = await Incident.findById(req.params.id);
        if (!incident) {
            return res.status(404).json({ success: false, message: 'Incident not found' });
        }

        // Copy update fields to local model
        const fieldsToUpdate = [
            'incidentName', 'threatType', 'severity', 'priority', 
            'sourceIp', 'destinationIp', 'assignedAnalyst', 'status', 'resolutionNotes'
        ];

        fieldsToUpdate.forEach(field => {
            if (req.body[field] !== undefined) {
                incident[field] = req.body[field];
            }
        });

        // Enforce trigger consistency locally (Priority=High forces Status=New on new updates too)
        if (incident.priority === 'High' && req.body.priority === 'High' && incident.isModified('priority')) {
            incident.status = 'New';
        }

        await incident.save();

        // Trigger Salesforce Sync
        const sfId = await sfService.syncIncidentToSalesforce(incident);
        if (sfId && sfId !== incident.salesforceId) {
            incident.salesforceId = sfId;
            await incident.save();
        }

        return res.json({
            success: true,
            message: 'Incident updated successfully',
            incident,
            aiPrediction: calculateAiThreatPrediction(incident)
        });
    } catch (error) {
        console.error('❌ [Incident Controller] Update Error:', error);
        return res.status(400).json({ success: false, message: 'Failed to update incident details', error: error.message });
    }
};

/**
 * Deletes an incident record locally and dispatches a REST delete operation to Salesforce
 */
exports.deleteIncident = async (req, res) => {
    try {
        const incident = await Incident.findById(req.params.id);
        if (!incident) {
            return res.status(404).json({ success: false, message: 'Incident not found' });
        }

        // Delete from Salesforce Custom Object if mapped
        if (incident.salesforceId) {
            await sfService.deleteIncidentFromSalesforce(incident.salesforceId);
        }

        // Remove from MongoDB
        await Incident.findByIdAndDelete(req.params.id);

        return res.json({
            success: true,
            message: 'Incident successfully purged from database and Salesforce'
        });
    } catch (error) {
        console.error('❌ [Incident Controller] Purge Error:', error);
        return res.status(500).json({ success: false, message: 'Server error purging incident' });
    }
};
