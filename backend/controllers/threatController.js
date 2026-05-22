const ThreatLog = require('../models/ThreatLog');
const Incident = require('../models/Incident');
const sfService = require('../services/salesforceService');

/**
 * Creates a new Threat Intrusion Log
 */
exports.createThreatLog = async (req, res) => {
    try {
        const threatLog = new ThreatLog(req.body);
        await threatLog.save();

        // Synchronize to Salesforce custom object Threat_Log__c
        const sfId = await sfService.syncThreatLogToSalesforce(threatLog);
        if (sfId) {
            threatLog.salesforceId = sfId;
            await threatLog.save();
        }

        return res.status(201).json({
            success: true,
            message: 'Threat intrusion logged and synchronized successfully',
            threatLog
        });
    } catch (error) {
        console.error('❌ [Threat Controller] Create Log Error:', error);
        return res.status(400).json({ success: false, message: 'Failed to record threat log', error: error.message });
    }
};

/**
 * Lists threat logs with optional filters and linked incidents populated
 */
exports.getThreatLogs = async (req, res) => {
    try {
        const { threatLevel, threatType } = req.query;
        const query = {};

        if (threatLevel) query.threatLevel = threatLevel;
        if (threatType) query.threatType = threatType;

        const logs = await ThreatLog.find(query)
            .populate('linkedIncident', 'incidentName severity status')
            .sort({ createdAt: -1 });

        return res.json({ success: true, count: logs.length, logs });
    } catch (error) {
        console.error('❌ [Threat Controller] Fetch Logs Error:', error);
        return res.status(500).json({ success: false, message: 'Server error fetching threat logs' });
    }
};

/**
 * Aggregates threat logs data to yield high-fidelity visual statistics for Recharts
 */
exports.getThreatAnalytics = async (req, res) => {
    try {
        // 1. Group by Threat Type (Malware, DDoS, Phishing etc.) for Pie Chart
        const typeDistribution = await ThreatLog.aggregate([
            { $group: { _id: '$threatType', value: { $sum: 1 } } },
            { $project: { name: '$_id', value: 1, _id: 0 } }
        ]);

        // 2. Group by Threat Level (Low, Medium, High) for Severity Radar or Bar Chart
        const levelDistribution = await ThreatLog.aggregate([
            { $group: { _id: '$threatLevel', count: { $sum: 1 } } },
            { $project: { level: '$_id', count: 1, _id: 0 } }
        ]);

        // 3. Simulated Trend over the past 7 days (incident frequency)
        const dateOffset = (days) => {
            const date = new Date();
            date.setDate(date.getDate() - days);
            return date.toISOString().split('T')[0];
        };

        const threatTrend = [
            { date: dateOffset(6), IntrusionAttacks: 12, BlockedDDoS: 24, SystemAlerts: 4 },
            { date: dateOffset(5), IntrusionAttacks: 18, BlockedDDoS: 35, SystemAlerts: 7 },
            { date: dateOffset(4), IntrusionAttacks: 15, BlockedDDoS: 18, SystemAlerts: 3 },
            { date: dateOffset(3), IntrusionAttacks: 22, BlockedDDoS: 42, SystemAlerts: 9 },
            { date: dateOffset(2), IntrusionAttacks: 29, BlockedDDoS: 48, SystemAlerts: 12 },
            { date: dateOffset(1), IntrusionAttacks: 25, BlockedDDoS: 38, SystemAlerts: 8 },
            { date: dateOffset(0), IntrusionAttacks: 32, BlockedDDoS: 55, SystemAlerts: 15 }
        ];

        return res.json({
            success: true,
            typeDistribution,
            levelDistribution,
            threatTrend
        });
    } catch (error) {
        console.error('❌ [Threat Controller] Aggregation Error:', error);
        return res.status(500).json({ success: false, message: 'Server error generating threat analytics graphs' });
    }
};
