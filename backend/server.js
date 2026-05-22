/**
 * @description AegisSentinel SOC Platform Express Server.
 *              Coordinates auth, threat detection logging, analyst profiles, and Salesforce syncing.
 * @author Antigravity
 * @date 2026-05-22
 */

require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

// Import Controllers & Services
const authController = require('./controllers/authController');
const incidentController = require('./controllers/incidentController');
const threatController = require('./controllers/threatController');
const analystController = require('./controllers/analystController');
const salesforceController = require('./controllers/salesforceController');

// Import Middleware
const authMiddleware = require('./middleware/authMiddleware');
const roleMiddleware = require('./middleware/roleMiddleware');

const app = express();
const PORT = process.env.PORT || 5001;

// Global Middleware
app.use(cors());
app.use(express.json());

// --- REST ROUTE MAPPINGS ---

// 1. Authentication Endpoints
app.post('/api/auth/register', authController.register);
app.post('/api/auth/login', authController.login);
app.get('/api/auth/profile', authMiddleware, authController.getProfile);

// 2. Incident Management Endpoints (RBAC applied)
app.get('/api/incidents', authMiddleware, incidentController.getIncidents);
app.get('/api/incidents/:id', authMiddleware, incidentController.getIncidentById);
app.post('/api/incidents', authMiddleware, incidentController.createIncident);
app.put('/api/incidents/:id', authMiddleware, incidentController.updateIncident);
app.delete('/api/incidents/:id', authMiddleware, roleMiddleware('Admin', 'Security Engineer'), incidentController.deleteIncident);

// 3. Threat Intelligence Logs Endpoints
app.get('/api/threats', authMiddleware, threatController.getThreatLogs);
app.get('/api/threats/analytics', authMiddleware, threatController.getThreatAnalytics);
app.post('/api/threats', authMiddleware, threatController.createThreatLog);

// 4. Analyst Metrics Endpoints
app.get('/api/analysts/leaderboard', authMiddleware, analystController.getLeaderboard);
app.post('/api/analysts', authMiddleware, roleMiddleware('Admin'), analystController.createOrUpdateAnalyst);

// 5. Salesforce Admin Sync Integration Endpoints
app.get('/api/salesforce/status', authMiddleware, salesforceController.getConnectionStatus);
app.post('/api/salesforce/sync', authMiddleware, roleMiddleware('Admin'), salesforceController.triggerBulkSync);

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({ success: true, status: 'Online', timestamp: new Date() });
});

// --- DATABASE CONNECTION & AUTOMATED SEEDING ---
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/aegissentinel';

mongoose.connect(MONGODB_URI, { serverSelectionTimeoutMS: 2000 })
    .then(async () => {
        console.log('💚 [Mongoose] Successfully established connection with MongoDB database.');
        await seedSampleData();
        
        app.listen(PORT, () => {
            console.log(`🛡️ [AegisSentinel Server] System online and listening on PORT: ${PORT}`);
            console.log(`🔗 REST Base Path: http://localhost:${PORT}/api`);
        });
    })
    .catch(async (err) => {
        console.error('❌ [Mongoose] Initial connection failure:', err.message);
        console.log('⚠️ [AegisSentinel Server] Running without a persistent MongoDB session (Dev Fallback Active)...');
        
        // Dynamic fallback to the local mock in-memory database
        const { setupInMemoryDatabase } = require('./services/inMemoryDb');
        setupInMemoryDatabase();
        
        // Seed the in-memory mock database with standard assets
        await seedSampleData();
        
        // Graceful failover to bind HTTP server even without MongoDB (helps user verify logic in sandboxes)
        app.listen(PORT, () => {
            console.log(`🛡️ [AegisSentinel Server] System online on PORT: ${PORT} (DEV MOCK DATABASE ENGINE ONLINE)`);
            console.log(`🔗 REST Base Path: http://localhost:${PORT}/api`);
        });
    });

/**
 * Automates seeding of clean, comprehensive sample data to ensure the SOC system is functional immediately.
 */
async function seedSampleData() {
    try {
        const User = require('./models/User');
        const Analyst = require('./models/Analyst');
        const Incident = require('./models/Incident');
        const ThreatLog = require('./models/ThreatLog');

        // 1. Seed Default Analysts Metrics
        const analystCount = await Analyst.countDocuments();
        if (analystCount === 0) {
            console.log('🌱 [Seeder] Seeding default analyst metrics data...');
            const defaultAnalysts = [
                { analystName: 'Anjali Singh', email: 'anjali.singh@aegissentinel.gov', casesResolved: 48, averageResponseTime: 1.4, slaCompliance: 98.6 },
                { analystName: 'Rahul Sharma', email: 'rahul.sharma@aegissentinel.gov', casesResolved: 42, averageResponseTime: 1.8, slaCompliance: 95.2 },
                { analystName: 'Priya Verma', email: 'priya.verma@aegissentinel.gov', casesResolved: 35, averageResponseTime: 2.1, slaCompliance: 92.8 }
            ];
            await Analyst.insertMany(defaultAnalysts);
            console.log('🌱 [Seeder] Analyst metrics seeded successfully.');
        }

        // 2. Seed Default Authentication User Profiles
        const userCount = await User.countDocuments();
        if (userCount === 0) {
            console.log('🌱 [Seeder] Seeding default credentials users...');
            // Seeds standard analysts and one admin profile (Password: 'password123')
            await User.create([
                { name: 'Anjali Singh', email: 'anjali@aegis.com', password: 'password123', role: 'Analyst' },
                { name: 'Rahul Sharma', email: 'rahul@aegis.com', password: 'password123', role: 'Security Engineer' },
                { name: 'Administrator', email: 'admin@aegis.com', password: 'password123', role: 'Admin' }
            ]);
            console.log('🌱 [Seeder] Default user profiles created: \n  - Analyst: anjali@aegis.com (password123)\n  - Engineer: rahul@aegis.com (password123)\n  - Admin: admin@aegis.com (password123)');
        }

        // 3. Seed Cyber Incidents
        const incidentCount = await Incident.countDocuments();
        if (incidentCount === 0) {
            console.log('🌱 [Seeder] Seeding incident logs data...');
            const defaultIncidents = [
                {
                    incidentName: 'Extrusion Firewall Probe Detected',
                    threatType: 'Suspicious Login Attempt',
                    severity: 'Low',
                    priority: 'Low',
                    sourceIp: '185.220.101.44',
                    destinationIp: '10.0.4.15',
                    assignedAnalyst: 'Priya Verma',
                    status: 'Resolved',
                    resolutionNotes: 'Verified port probe attempt. Firewall successfully rate-limited and logged original IP on blacklist.'
                },
                {
                    incidentName: 'Internal Network Endpoint DDoS Spike',
                    threatType: 'DDoS Traffic Spike',
                    severity: 'High',
                    priority: 'High',
                    sourceIp: '45.142.120.11',
                    destinationIp: '10.0.1.200',
                    assignedAnalyst: 'Anjali Singh',
                    status: 'In Progress',
                    resolutionNotes: ''
                },
                {
                    incidentName: 'Intrusion Alert: Financial Sandbox Ransomware Trigger',
                    threatType: 'Ransomware Payload',
                    severity: 'High',
                    priority: 'High',
                    sourceIp: '91.240.118.82',
                    destinationIp: '192.168.4.88',
                    assignedAnalyst: 'Rahul Sharma',
                    status: 'New',
                    resolutionNotes: ''
                },
                {
                    incidentName: 'Corporate Email Spoofing Audit',
                    threatType: 'Phishing Email Attack',
                    severity: 'Medium',
                    priority: 'Medium',
                    sourceIp: '103.24.12.8',
                    destinationIp: '10.0.8.44',
                    assignedAnalyst: 'Anjali Singh',
                    status: 'In Progress',
                    resolutionNotes: ''
                }
            ];
            const seededIncidents = await Incident.insertMany(defaultIncidents);
            console.log('🌱 [Seeder] Incidents seeded successfully.');

            // 4. Seed Threat Activity Logs linked to parent incidents
            const threatLogCount = await ThreatLog.countDocuments();
            if (threatLogCount === 0) {
                console.log('🌱 [Seeder] Seeding threat intelligence logs...');
                await ThreatLog.insertMany([
                    { threatLogName: 'Malware Signature Detection TL-001', threatType: 'Malware Attack', threatLevel: 'Medium', sourceIp: '198.51.100.22', destinationIp: '192.168.1.15', linkedIncident: seededIncidents[0]._id },
                    { threatLogName: 'Inbound SYN Flood DD-994', threatType: 'DDoS Traffic Spike', threatLevel: 'High', sourceIp: '45.142.120.11', destinationIp: '10.0.1.200', linkedIncident: seededIncidents[1]._id },
                    { threatLogName: 'Critical Wannacry Registry Probe', threatType: 'Ransomware Payload', threatLevel: 'High', sourceIp: '91.240.118.82', destinationIp: '192.168.4.88', linkedIncident: seededIncidents[2]._id },
                    { threatLogName: 'Phishing Redirect Link Captured', threatType: 'Phishing Email Attack', threatLevel: 'Medium', sourceIp: '103.24.12.8', destinationIp: '10.0.8.44', linkedIncident: seededIncidents[3]._id },
                    { threatLogName: 'Brute Force Attempts Registry Log', threatType: 'Suspicious Login Attempt', threatLevel: 'Low', sourceIp: '185.220.101.44', destinationIp: '10.0.4.15', linkedIncident: seededIncidents[0]._id }
                ]);
                console.log('🌱 [Seeder] Threat logs successfully linked and seeded.');
            }
        }
    } catch (err) {
        console.error('❌ [Seeder] Error executing database seeder:', err);
    }
}
