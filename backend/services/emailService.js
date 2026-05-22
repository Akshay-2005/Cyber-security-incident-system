const nodemailer = require('nodemailer');

// Initialize transporter with default placeholder/Ethereal credentials
// In production, these should be fully configured via the .env file
const smtpConfig = {
    host: process.env.SMTP_HOST || 'smtp.ethereal.email',
    port: parseInt(process.env.SMTP_PORT || '587'),
    auth: {
        user: process.env.SMTP_USER || 'mock.analyst@ethereal.email',
        pass: process.env.SMTP_PASS || 'mock_password'
    }
};

const transporter = nodemailer.createTransport(smtpConfig);

/**
 * Sends a high-security emergency email alert to the SOC team.
 * Falls back gracefully to terminal logging if the SMTP server is offline.
 * @param {Object} incident Incident model instance
 */
const sendEmergencyAlertEmail = async (incident) => {
    const subject = `🚨 CRITICAL SECURITY INTRUSION: ${incident.incidentName} [${incident.severity.toUpperCase()} SEVERITY]`;
    
    const htmlTemplate = `
    <!DOCTYPE html>
    <html>
    <head>
        <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #E2E8F0; background-color: #0B0F19; margin: 0; padding: 20px; }
            .container { max-width: 600px; margin: 0 auto; background: linear-gradient(135deg, #111827 0%, #030712 100%); border: 2px solid #EF4444; border-radius: 8px; overflow: hidden; box-shadow: 0 0 20px rgba(239, 68, 68, 0.3); }
            .header { background: linear-gradient(90deg, #991B1B 0%, #EF4444 100%); color: white; padding: 20px; text-align: center; font-size: 24px; font-weight: bold; letter-spacing: 2px; }
            .content { padding: 30px; font-size: 16px; line-height: 1.6; }
            .field-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin: 20px 0; background: rgba(255, 255, 255, 0.05); padding: 15px; border-radius: 6px; border-left: 4px solid #EF4444; }
            .field-label { font-weight: bold; color: #94A3B8; font-size: 12px; text-transform: uppercase; }
            .field-value { font-size: 15px; color: #F8FAFC; margin-bottom: 8px; }
            .alert-footer { background: #030712; padding: 15px; text-align: center; font-size: 12px; color: #64748B; border-top: 1px solid #1E293B; }
            .badge { display: inline-block; padding: 4px 8px; border-radius: 4px; font-weight: bold; font-size: 12px; text-transform: uppercase; }
            .badge-danger { background-color: #7F1D1D; color: #FECACA; border: 1px solid #EF4444; }
            .badge-warning { background-color: #78350F; color: #FEF3C7; border: 1px solid #F59E0B; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                AEGIS SENTINEL SOC EMERGENCY
            </div>
            <div class="content">
                <p>Hello Security Operations Team,</p>
                <p>A critical, <strong>${incident.severity.toUpperCase()}</strong> severity security threat has been recorded and registered by the AegisSentinel security gateway. High-level incident response protocols are now active.</p>
                
                <div class="field-grid">
                    <div>
                        <div class="field-label">Incident Name</div>
                        <div class="field-value">${incident.incidentName}</div>
                    </div>
                    <div>
                        <div class="field-label">Threat Type</div>
                        <div class="field-value">${incident.threatType}</div>
                    </div>
                    <div>
                        <div class="field-label">Severity / Priority</div>
                        <div class="field-value">
                            <span class="badge badge-danger">${incident.severity}</span> / 
                            <span class="badge badge-warning">${incident.priority}</span>
                        </div>
                    </div>
                    <div>
                        <div class="field-label">Assigned Analyst</div>
                        <div class="field-value">${incident.assignedAnalyst}</div>
                    </div>
                    <div>
                        <div class="field-label">Source IP Address</div>
                        <div class="field-value"><code>${incident.sourceIp}</code></div>
                    </div>
                    <div>
                        <div class="field-label">Destination IP Target</div>
                        <div class="field-value"><code>${incident.destinationIp}</code></div>
                    </div>
                </div>

                <p><strong>Required Action:</strong> Ensure the assigned analyst <strong>${incident.assignedAnalyst}</strong> initiates threat containment processes within the SLA response window.</p>
            </div>
            <div class="alert-footer">
                This is an automated intelligence message dispatched by AegisSentinel Gateway. Do not reply directly to this mailer.
            </div>
        </div>
    </body>
    </html>
    `;

    try {
        const info = await transporter.sendMail({
            from: process.env.EMAIL_FROM || '"AegisSentinel Gateway" <alerts@aegissentinel.gov>',
            to: 'soc-operations@aegissentinel.gov',
            subject: subject,
            html: htmlTemplate
        });
        
        console.log(`📧 [AegisSentinel Alerts] Emergency email alert successfully dispatched. MessageId: ${info.messageId}`);
        return true;
    } catch (error) {
        // Safe failover logging
        console.warn(`⚠️ [AegisSentinel Alerts] SMTP Dispatch failed (or Ethereal mock offline). Fallback output:`);
        console.log(`----------------------------------------------------------------------`);
        console.log(`[ALERT OUTBOUND] SUBJECT: ${subject}`);
        console.log(`[ALERT OUTBOUND] DETAILS: ${incident.incidentName} | Src: ${incident.sourceIp} | Dst: ${incident.destinationIp}`);
        console.log(`----------------------------------------------------------------------`);
        return false;
    }
};

module.exports = {
    sendEmergencyAlertEmail
};
