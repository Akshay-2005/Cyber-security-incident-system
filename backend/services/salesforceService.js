/**
 * @description Salesforce REST Integration Service for AegisSentinel.
 *              Maintains synchronization between local MongoDB collections and Salesforce custom objects:
 *              - Cyber_Incident__c
 *              - Threat_Log__c
 *              - Analyst_Performance__c
 *              Handles dynamic mock/simulation failover if integration credentials are not configured.
 * @author Antigravity
 * @date 2026-05-22
 */

const https = require('https');
const url = require('url');

const IS_SIMULATED = (process.env.SF_INTEGRATION_MODE || 'SIMULATED').toUpperCase() === 'SIMULATED';

// Cached Session Credentials
let connectionSession = {
    accessToken: null,
    instanceUrl: null,
    expiresAt: null
};

/**
 * Dispatches HTTPS requests (native implementation to avoid extra dependencies)
 */
function makeRequest(options, postData = null) {
    return new Promise((resolve, reject) => {
        const req = https.request(options, (res) => {
            let data = '';
            res.on('data', (chunk) => { data += chunk; });
            res.on('end', () => {
                let parsed = data;
                try { parsed = JSON.parse(data); } catch (e) {}
                resolve({ statusCode: res.statusCode, body: parsed });
            });
        });
        
        req.on('error', (err) => { reject(err); });
        
        if (postData) {
            req.write(typeof postData === 'string' ? postData : JSON.stringify(postData));
        }
        req.end();
    });
}

/**
 * Handles OAuth 2.0 Web Server/Username Password Authentication flow with Salesforce REST Identity Provider.
 */
async function authenticateSalesforce() {
    if (IS_SIMULATED) {
        connectionSession = {
            accessToken: 'MOCK_SF_OAUTH_TOKEN_AEGIS_SENTINEL_2026',
            instanceUrl: 'https://aegis-sentinel-developer-edition.na150.force.com',
            expiresAt: Date.now() + 3600 * 1000
        };
        console.log(`🛡️ [Salesforce Integration] Auth initialized in SIMULATED mode. Session Token generated.`);
        return connectionSession;
    }

    // Check if token cached and still valid
    if (connectionSession.accessToken && connectionSession.expiresAt > Date.now()) {
        return connectionSession;
    }

    const loginUrl = process.env.SF_LOGIN_URL || 'https://login.salesforce.com';
    const clientId = process.env.SF_CLIENT_ID;
    const clientSecret = process.env.SF_CLIENT_SECRET;
    const username = process.env.SF_USERNAME;
    const password = process.env.SF_PASSWORD;
    const securityToken = process.env.SF_SECURITY_TOKEN || '';

    if (!clientId || !clientSecret || !username || !password) {
        console.warn(`⚠️ [Salesforce Integration] Credentials incomplete in .env. Falling back to SIMULATED mode.`);
        return authenticateSimulatedSession();
    }

    try {
        console.log(`🛡️ [Salesforce Integration] Requesting OAuth token from ${loginUrl}...`);
        
        const params = new URLSearchParams({
            grant_type: 'password',
            client_id: clientId,
            client_secret: clientSecret,
            username: username,
            password: password + securityToken
        }).toString();

        const parsedUrl = url.parse(`${loginUrl}/services/oauth2/token`);
        const options = {
            hostname: parsedUrl.hostname,
            path: parsedUrl.path,
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Content-Length': Buffer.byteLength(params)
            }
        };

        const response = await makeRequest(options, params);

        if (response.statusCode === 200 && response.body.access_token) {
            connectionSession = {
                accessToken: response.body.access_token,
                instanceUrl: response.body.instance_url,
                expiresAt: Date.now() + 3600 * 1000 // Tokens are typically valid for 1-2 hours
            };
            console.log(`💚 [Salesforce Integration] Authenticated successfully with instance: ${connectionSession.instanceUrl}`);
            return connectionSession;
        } else {
            throw new Error(response.body.error_description || 'OAuth Request Failed');
        }
    } catch (err) {
        console.error(`❌ [Salesforce Integration] OAuth failure: ${err.message}. Defaulting to SIMULATED mode.`);
        return authenticateSimulatedSession();
    }
}

function authenticateSimulatedSession() {
    connectionSession = {
        accessToken: 'MOCK_SF_OAUTH_TOKEN_AEGIS_SENTINEL_2026',
        instanceUrl: 'https://aegis-sentinel-developer-edition.na150.force.com',
        expiresAt: Date.now() + 3600 * 1000
    };
    return connectionSession;
}

/**
 * Synchronizes a local Cyber Incident record with the Salesforce Cyber_Incident__c Custom Object.
 * @param {Object} incident Local Mongoose Incident model instance
 * @returns {String|null} Salesforce Record ID
 */
async function syncIncidentToSalesforce(incident) {
    const session = await authenticateSalesforce();
    
    // Map Mongoose schema fields to Salesforce custom field API names
    const sfPayload = {
        Incident_Name__c: incident.incidentName,
        Threat_Type__c: incident.threatType,
        Severity__c: incident.severity,
        Priority__c: incident.priority,
        Source_IP__c: incident.sourceIp,
        Destination_IP__c: incident.destinationIp,
        Status__c: incident.status,
        Resolution_Notes__c: incident.resolutionNotes || ''
    };

    if (IS_SIMULATED || session.accessToken === 'MOCK_SF_OAUTH_TOKEN_AEGIS_SENTINEL_2026') {
        const mockId = incident.salesforceId || `a008d00000Mock${Math.random().toString(36).substring(2, 9).toUpperCase()}`;
        console.log(`------------------------------------------------------------`);
        console.log(`🚨 [SALESFORCE SYNC SIMULATOR] Custom Object: Cyber_Incident__c`);
        console.log(`[ACTION] ${incident.salesforceId ? 'UPDATE [PUT]' : 'CREATE [POST]'}`);
        console.log(`[TARGET RECORD] SalesforceId: ${mockId}`);
        console.log(`[PAYLOAD]:`, JSON.stringify(sfPayload, null, 2));
        console.log(`------------------------------------------------------------`);
        return mockId;
    }

    try {
        const hasSalesforceId = !!incident.salesforceId;
        const parsedUrl = url.parse(session.instanceUrl);
        
        let path = '/services/data/v60.0/sobjects/Cyber_Incident__c';
        let method = 'POST';
        
        if (hasSalesforceId) {
            path += `/${incident.salesforceId}`;
            method = 'PATCH'; // REST API uses PATCH for records update
        }

        const options = {
            hostname: parsedUrl.hostname,
            path: path,
            method: method,
            headers: {
                'Authorization': `Bearer ${session.accessToken}`,
                'Content-Type': 'application/json'
            }
        };

        console.log(`🛡️ [Salesforce Integration] Synchronizing record ${incident.incidentName}...`);
        const response = await makeRequest(options, sfPayload);

        if (response.statusCode === 201 && response.body.id) {
            console.log(`💚 [Salesforce Integration] Created Cyber_Incident__c successfully. ID: ${response.body.id}`);
            return response.body.id;
        } else if (response.statusCode === 204) {
            console.log(`💚 [Salesforce Integration] Updated Cyber_Incident__c record: ${incident.salesforceId}`);
            return incident.salesforceId;
        } else {
            console.error(`❌ [Salesforce Integration] Sync failure (Status: ${response.statusCode}):`, response.body);
            return null;
        }
    } catch (err) {
        console.error(`❌ [Salesforce Integration] API communication error: ${err.message}`);
        return null;
    }
}

/**
 * Removes a record from Salesforce Cyber_Incident__c custom object.
 * @param {String} salesforceId
 */
async function deleteIncidentFromSalesforce(salesforceId) {
    if (!salesforceId) return false;
    const session = await authenticateSalesforce();

    if (IS_SIMULATED || session.accessToken === 'MOCK_SF_OAUTH_TOKEN_AEGIS_SENTINEL_2026') {
        console.log(`------------------------------------------------------------`);
        console.log(`🚨 [SALESFORCE SYNC SIMULATOR] Custom Object: Cyber_Incident__c`);
        console.log(`[ACTION] DELETE [DELETE]`);
        console.log(`[TARGET RECORD] SalesforceId: ${salesforceId}`);
        console.log(`------------------------------------------------------------`);
        return true;
    }

    try {
        const parsedUrl = url.parse(session.instanceUrl);
        const options = {
            hostname: parsedUrl.hostname,
            path: `/services/data/v60.0/sobjects/Cyber_Incident__c/${salesforceId}`,
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${session.accessToken}`
            }
        };

        console.log(`🛡️ [Salesforce Integration] Deleting record ${salesforceId} from Salesforce...`);
        const response = await makeRequest(options);

        if (response.statusCode === 204) {
            console.log(`💚 [Salesforce Integration] Deleted Cyber_Incident__c successfully.`);
            return true;
        } else {
            console.error(`❌ [Salesforce Integration] Delete failed (Status: ${response.statusCode})`);
            return false;
        }
    } catch (err) {
        console.error(`❌ [Salesforce Integration] Delete API call failure: ${err.message}`);
        return false;
    }
}

/**
 * Synchronizes local Threat Log data into Salesforce Threat_Log__c.
 */
async function syncThreatLogToSalesforce(threatLog) {
    const session = await authenticateSalesforce();
    
    const sfPayload = {
        Name: threatLog.threatLogName,
        Threat_Type__c: threatLog.threatType,
        Threat_Level__c: threatLog.threatLevel,
        Source_IP__c: threatLog.sourceIp,
        Destination_IP__c: threatLog.destinationIp
    };

    if (IS_SIMULATED || session.accessToken === 'MOCK_SF_OAUTH_TOKEN_AEGIS_SENTINEL_2026') {
        const mockId = threatLog.salesforceId || `a018d00000Mock${Math.random().toString(36).substring(2, 9).toUpperCase()}`;
        console.log(`------------------------------------------------------------`);
        console.log(`🚨 [SALESFORCE SYNC SIMULATOR] Custom Object: Threat_Log__c`);
        console.log(`[ACTION] ${threatLog.salesforceId ? 'UPDATE [PUT]' : 'CREATE [POST]'}`);
        console.log(`[TARGET RECORD] SalesforceId: ${mockId}`);
        console.log(`[PAYLOAD]:`, JSON.stringify(sfPayload, null, 2));
        console.log(`------------------------------------------------------------`);
        return mockId;
    }

    try {
        const hasSalesforceId = !!threatLog.salesforceId;
        const parsedUrl = url.parse(session.instanceUrl);
        let path = '/services/data/v60.0/sobjects/Threat_Log__c';
        let method = 'POST';
        
        if (hasSalesforceId) {
            path += `/${threatLog.salesforceId}`;
            method = 'PATCH';
        }

        const options = {
            hostname: parsedUrl.hostname,
            path: path,
            method: method,
            headers: {
                'Authorization': `Bearer ${session.accessToken}`,
                'Content-Type': 'application/json'
            }
        };

        const response = await makeRequest(options, sfPayload);

        if (response.statusCode === 201 && response.body.id) {
            console.log(`💚 [Salesforce Integration] Created Threat_Log__c successfully. ID: ${response.body.id}`);
            return response.body.id;
        } else if (response.statusCode === 204) {
            console.log(`💚 [Salesforce Integration] Updated Threat_Log__c successfully.`);
            return threatLog.salesforceId;
        }
        return null;
    } catch (err) {
        console.error(`❌ [Salesforce Integration] Threat Log Sync communication error: ${err.message}`);
        return null;
    }
}

/**
 * Synchronizes local Analyst Performance metrics into Salesforce Analyst_Performance__c.
 */
async function syncAnalystToSalesforce(analyst) {
    const session = await authenticateSalesforce();
    
    const sfPayload = {
        Name: analyst.analystName,
        Cases_Resolved__c: analyst.casesResolved,
        Average_Response_Time__c: analyst.averageResponseTime,
        SLA_Compliance__c: analyst.slaCompliance / 100.0 // Salesforce Percent field maps decimal (e.g. 0.985 = 98.5%)
    };

    if (IS_SIMULATED || session.accessToken === 'MOCK_SF_OAUTH_TOKEN_AEGIS_SENTINEL_2026') {
        const mockId = analyst.salesforceId || `a028d00000Mock${Math.random().toString(36).substring(2, 9).toUpperCase()}`;
        console.log(`------------------------------------------------------------`);
        console.log(`🚨 [SALESFORCE SYNC SIMULATOR] Custom Object: Analyst_Performance__c`);
        console.log(`[ACTION] ${analyst.salesforceId ? 'UPDATE [PUT]' : 'CREATE [POST]'}`);
        console.log(`[TARGET RECORD] SalesforceId: ${mockId}`);
        console.log(`[PAYLOAD]:`, JSON.stringify(sfPayload, null, 2));
        console.log(`------------------------------------------------------------`);
        return mockId;
    }

    try {
        const hasSalesforceId = !!analyst.salesforceId;
        const parsedUrl = url.parse(session.instanceUrl);
        let path = '/services/data/v60.0/sobjects/Analyst_Performance__c';
        let method = 'POST';
        
        if (hasSalesforceId) {
            path += `/${analyst.salesforceId}`;
            method = 'PATCH';
        }

        const options = {
            hostname: parsedUrl.hostname,
            path: path,
            method: method,
            headers: {
                'Authorization': `Bearer ${session.accessToken}`,
                'Content-Type': 'application/json'
            }
        };

        const response = await makeRequest(options, sfPayload);

        if (response.statusCode === 201 && response.body.id) {
            console.log(`💚 [Salesforce Integration] Created Analyst_Performance__c successfully. ID: ${response.body.id}`);
            return response.body.id;
        } else if (response.statusCode === 204) {
            console.log(`💚 [Salesforce Integration] Updated Analyst_Performance__c successfully.`);
            return analyst.salesforceId;
        }
        return null;
    } catch (err) {
        console.error(`❌ [Salesforce Integration] Analyst Sync communication error: ${err.message}`);
        return null;
    }
}

module.exports = {
    authenticateSalesforce,
    syncIncidentToSalesforce,
    deleteIncidentFromSalesforce,
    syncThreatLogToSalesforce,
    syncAnalystToSalesforce,
    IS_SIMULATED
};
