const express = require('express');
const router = express.Router();

// RBI guidelines reference thresholds
const FRAUD_THRESHOLDS = {
    maxInterestRate: 20,           // Above 20% is suspicious
    maxProcessingFee: 5,           // Above 5% is suspicious
    maxPrepaymentPenalty: 4,       // Above 4% is suspicious
    minTenureMonths: 3,            // Less than 3 months is suspicious for large loans
    guaranteedApprovalKeywords: [
        'guaranteed approval', '100% approval', 'no rejection',
        'instant approval without documents', 'no credit check required',
        'guaranteed loan', 'approval guarantee'
    ]
};

// @desc    Check loan offer for fraud indicators
// @route   POST /api/fraud-check
// @access  Public
router.post('/', (req, res) => {
    try {
        const {
            interestRate,
            processingFee,
            prepaymentPenalty,
            tenure,
            loanAmount,
            offerDescription,
            lenderName
        } = req.body;

        const alerts = [];
        let riskLevel = 'low'; // low, medium, high
        let riskScore = 0;

        // Check interest rate
        if (interestRate && parseFloat(interestRate) > FRAUD_THRESHOLDS.maxInterestRate) {
            alerts.push({
                type: 'HIGH_INTEREST',
                severity: 'high',
                title: 'Unusually High Interest Rate',
                message: `Interest rate of ${interestRate}% exceeds RBI fair lending guidelines. Most legitimate lenders charge 8-18% for personal loans.`,
                recommendation: 'Compare with rates offered by nationalized banks before proceeding.'
            });
            riskScore += 35;
        }

        // Check processing fee
        if (processingFee && parseFloat(processingFee) > FRAUD_THRESHOLDS.maxProcessingFee) {
            alerts.push({
                type: 'HIGH_FEES',
                severity: 'high',
                title: 'Excessive Processing Fee',
                message: `Processing fee of ${processingFee}% is above the standard limit. Legitimate banks charge 1-3% processing fee.`,
                recommendation: 'Never pay upfront fees before loan disbursement. This is a common fraud tactic.'
            });
            riskScore += 30;
        }

        // Check prepayment penalty
        if (prepaymentPenalty && parseFloat(prepaymentPenalty) > FRAUD_THRESHOLDS.maxPrepaymentPenalty) {
            alerts.push({
                type: 'HIGH_PREPAYMENT',
                severity: 'medium',
                title: 'High Prepayment Penalty',
                message: `Prepayment penalty of ${prepaymentPenalty}% is unusually high. RBI has capped prepayment charges for floating rate loans.`,
                recommendation: 'Ask for the complete fee schedule in writing before signing.'
            });
            riskScore += 15;
        }

        // Check for unrealistic approval guarantees
        if (offerDescription) {
            const desc = offerDescription.toLowerCase();
            const guaranteeMatch = FRAUD_THRESHOLDS.guaranteedApprovalKeywords.find(k => desc.includes(k));
            if (guaranteeMatch) {
                alerts.push({
                    type: 'FAKE_GUARANTEE',
                    severity: 'high',
                    title: 'Unrealistic Approval Guarantee',
                    message: 'No legitimate lender can guarantee 100% loan approval. All loans require credit assessment.',
                    recommendation: 'This is a red flag for a potential scam. Only apply through verified bank websites or branches.'
                });
                riskScore += 30;
            }
        }

        // Check suspiciously short tenure for large amounts
        if (tenure && loanAmount) {
            const tenureMonths = parseInt(tenure);
            const amount = parseFloat(loanAmount);
            if (tenureMonths < FRAUD_THRESHOLDS.minTenureMonths && amount > 100000) {
                alerts.push({
                    type: 'SHORT_TENURE',
                    severity: 'medium',
                    title: 'Suspiciously Short Repayment Period',
                    message: `Loan of ₹${amount.toLocaleString('en-IN')} with only ${tenureMonths} month tenure creates unreasonably high EMI burden.`,
                    recommendation: 'Verify the actual repayment terms carefully.'
                });
                riskScore += 10;
            }
        }

        // Determine overall risk level
        if (riskScore >= 50) riskLevel = 'high';
        else if (riskScore >= 20) riskLevel = 'medium';
        else riskLevel = 'low';

        const overallMessage = riskLevel === 'high'
            ? '⚠️ This loan offer appears risky based on RBI guidelines. We strongly recommend consulting a verified financial advisor.'
            : riskLevel === 'medium'
                ? '⚠️ Some aspects of this offer need careful review. Compare with other lenders.'
                : '✅ This loan offer appears to be within standard parameters.';

        res.json({
            riskLevel,
            riskScore: Math.min(100, riskScore),
            alerts,
            totalAlerts: alerts.length,
            overallMessage,
            guidelines: {
                rbiComplaintPortal: 'https://cms.rbi.org.in',
                sachetPortal: 'https://sachet.rbi.org.in',
                helpline: '14440 (RBI Helpline)'
            }
        });
    } catch (error) {
        console.error('Fraud Check Error:', error);
        res.status(500).json({ message: 'Failed to perform fraud check' });
    }
});

module.exports = router;
