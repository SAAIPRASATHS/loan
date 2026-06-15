const express = require('express');
const router = express.Router();

// @desc    Calculate EMI details
// @route   POST /api/emi
// @access  Public
router.post('/', (req, res) => {
    try {
        const { loanAmount, interestRate, tenure } = req.body;

        if (!loanAmount || !interestRate || !tenure) {
            return res.status(400).json({ message: 'loanAmount, interestRate, and tenure are required' });
        }

        const P = parseFloat(loanAmount);
        const annualRate = parseFloat(interestRate);
        const N = parseInt(tenure); // months

        if (P <= 0 || annualRate <= 0 || N <= 0) {
            return res.status(400).json({ message: 'All values must be positive numbers' });
        }

        const R = annualRate / 12 / 100; // monthly interest rate

        // EMI = P * R * (1+R)^N / ((1+R)^N - 1)
        const emiNumerator = P * R * Math.pow(1 + R, N);
        const emiDenominator = Math.pow(1 + R, N) - 1;
        const monthlyEMI = Math.round(emiNumerator / emiDenominator);

        const totalPayable = monthlyEMI * N;
        const totalInterest = totalPayable - P;

        // Generate monthly breakdown
        let balance = P;
        const monthlyBreakdown = [];

        for (let month = 1; month <= N; month++) {
            const interestComponent = Math.round(balance * R);
            const principalComponent = monthlyEMI - interestComponent;
            balance = Math.max(0, balance - principalComponent);

            monthlyBreakdown.push({
                month,
                emi: monthlyEMI,
                principal: principalComponent,
                interest: interestComponent,
                balance: Math.round(balance)
            });
        }

        res.json({
            monthlyEMI,
            totalInterest: Math.round(totalInterest),
            totalPayable: Math.round(totalPayable),
            loanAmount: P,
            interestRate: annualRate,
            tenure: N,
            monthlyBreakdown
        });
    } catch (error) {
        console.error('EMI Calculation Error:', error);
        res.status(500).json({ message: 'Failed to calculate EMI' });
    }
});

module.exports = router;
