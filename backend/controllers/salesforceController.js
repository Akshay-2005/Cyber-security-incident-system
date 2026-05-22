const sfService = require('../services/salesforceService');
const Incident = require('../models/Incident');
const ThreatLog = require('../models/ThreatLog');
const Analyst = require('../models/Analyst');

/**
 * Checks current connection state and active environmental configs
 */
exports.getConnectionStatus = async (req, res) => {
    try {
        const session = await sfService.authenticateSalesforce();
        
        return res.json({
            success: true,
            status: session.accessToken ? 'Connected' : 'Disconnected',
            integrationMode: sfService.IS_SIMULATED ? 'SIMULATED (Offline Logs)' : 'REAL (Salesforce REST)',
            instanceUrl: session.instanceUrl,
            authenticatedAt: new Date(),
            credentialsConfigured: !!(process.env.SF_CLIENT_ID && process.env.SF_CLIENT_SECRET)
        });
    } catch (error) {
        console.error('❌ [Salesforce Controller] Status Query Error:', error);
        return res.json({
            success: false,
            status: 'Error',
            integrationMode: 'Unknown',
            error: error.message
        });
    }
};

/**
 * Iterates through all local collections and uploads un-synced items to Salesforce
 */
exports.triggerBulkSync = async (req, res) => {
    try {
        console.log(`🛡️ [Salesforce Integration] Initiating massive data synchronization audit...`);
        
        // 1. Synchronize security analysts
        const localAnalysts = await Analyst.find({});
        let syncedAnalysts = 0;
        for (const analyst of localAnalysts) {
            const sfId = await sfService.syncAnalystToSalesforce(analyst);
            if (sfId) {
                analyst.salesforceId = sfId;
                await analyst.save();
                syncedAnalysts++;
            }
        }

        // 2. Synchronize Cyber Incidents
        const localIncidents = await Incident.find({});
        let syncedIncidents = 0;
        for (const incident of localIncidents) {
            const sfId = await sfService.syncIncidentToSalesforce(incident);
            if (sfId) {
                incident.salesforceId = sfId;
                await incident.save();
                syncedIncidents++;
            }
        }

        // 3. Synchronize threat activity logs
        const localThreatLogs = await ThreatLog.find({});
        let syncedThreatLogs = 0;
        for (const threatLog of localThreatLogs) {
            const sfId = await sfService.syncThreatLogToSalesforce(threatLog);
            if (sfId) {
                threatLog.salesforceId = sfId;
                await threatLog.save();
                syncedThreatLogs++;
            }
        }

        return res.json({
            success: true,
            message: 'Bulk database synchronization audit completed successfully.',
            metrics: {
                analysts: { total: localAnalysts.length, synced: syncedAnalysts },
                incidents: { total: localIncidents.length, synced: syncedIncidents },
                threatLogs: { total: localThreatLogs.length, synced: syncedThreatLogs }
            }
        });
    } catch (error) {
        console.error('❌ [Salesforce Controller] Massive Sync Error:', error);
        return res.status(500).json({ success: false, message: 'Server error during manual sync sequence', error: error.message });
    }
};
