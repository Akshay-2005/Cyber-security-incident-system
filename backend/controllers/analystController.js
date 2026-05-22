const Analyst = require('../models/Analyst');
const sfService = require('../services/salesforceService');

/**
 * Creates or updates an analyst performance card
 */
exports.createOrUpdateAnalyst = async (req, res) => {
    try {
        const { analystName, email, casesResolved, averageResponseTime, slaCompliance } = req.body;
        
        let analyst = await Analyst.findOne({ email });

        if (analyst) {
            // Update metrics
            analyst.analystName = analystName || analyst.analystName;
            analyst.casesResolved = casesResolved !== undefined ? casesResolved : analyst.casesResolved;
            analyst.averageResponseTime = averageResponseTime !== undefined ? averageResponseTime : analyst.averageResponseTime;
            analyst.slaCompliance = slaCompliance !== undefined ? slaCompliance : analyst.slaCompliance;
        } else {
            // Create brand new analyst metrics card
            analyst = new Analyst({ analystName, email, casesResolved, averageResponseTime, slaCompliance });
        }

        await analyst.save();

        // Sync to Salesforce custom object Analyst_Performance__c
        const sfId = await sfService.syncAnalystToSalesforce(analyst);
        if (sfId) {
            analyst.salesforceId = sfId;
            await analyst.save();
        }

        return res.json({
            success: true,
            message: 'Analyst performance logged successfully',
            analyst
        });
    } catch (error) {
        console.error('❌ [Analyst Controller] Write Metrics Error:', error);
        return res.status(400).json({ success: false, message: 'Failed to record analyst metrics', error: error.message });
    }
};

/**
 * Retrieves the SOC Leaderboard sorted by SLA compliance and cases resolved
 */
exports.getLeaderboard = async (req, res) => {
    try {
        const analysts = await Analyst.find({})
            .sort({ casesResolved: -1, slaCompliance: -1 });

        return res.json({
            success: true,
            count: analysts.length,
            leaderboard: analysts
        });
    } catch (error) {
        console.error('❌ [Analyst Controller] Fetch Leaderboard Error:', error);
        return res.status(500).json({ success: false, message: 'Server error retrieving leaderboard statistics' });
    }
};
