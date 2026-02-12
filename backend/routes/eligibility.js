const express = require('express');
const router = express.Router();

/**
 * Smart Loan Eligibility Engine
 * Calculates: FOIR ratio, disposable income, eligibility score, approval probability
 */

// @desc    Check loan eligibility with detailed analysis
// @route   POST /api/eligibility
// @access  Public
router.post('/', (req, res) => {
    try {
        const {
            monthlyIncome,
            existingEMIs,
            employmentType,
            loanAmount,
            creditScore,
            tenure
        } = req.body;

        if (!monthlyIncome || !loanAmount) {
            return res.status(400).json({
                message: 'monthlyIncome and loanAmount are required'
            });
        }

        const income = parseFloat(monthlyIncome);
        const emis = parseFloat(existingEMIs) || 0;
        const amount = parseFloat(loanAmount);
        const credit = parseInt(creditScore) || 650;
        const loanTenure = parseInt(tenure) || 60; // default 5 years
        const empType = (employmentType || 'employed').toLowerCase();

        // 1. Calculate disposable income
        const disposableIncome = income - emis;

        // 2. Calculate FOIR (Fixed Obligation to Income Ratio)
        const foirRatio = emis / income;
        const foirPercentage = Math.round(foirRatio * 100);

        // 3. Calculate estimated EMI for requested loan
        const annualRate = empType === 'self-employed' ? 12 : 10;
        const monthlyRate = annualRate / 12 / 100;
        const emiNumerator = amount * monthlyRate * Math.pow(1 + monthlyRate, loanTenure);
        const emiDenominator = Math.pow(1 + monthlyRate, loanTenure) - 1;
        const estimatedEMI = Math.round(emiNumerator / emiDenominator);

        // 4. New FOIR with requested loan
        const newFOIR = (emis + estimatedEMI) / income;
        const newFOIRPercentage = Math.round(newFOIR * 100);

        // 5. Calculate Eligibility Score (0-100)
        let eligibilityScore = 0;

        // Credit Score component (0-30 points)
        if (credit >= 750) eligibilityScore += 30;
        else if (credit >= 700) eligibilityScore += 25;
        else if (credit >= 650) eligibilityScore += 18;
        else if (credit >= 600) eligibilityScore += 10;
        else eligibilityScore += 5;

        // FOIR component (0-25 points) - lower is better
        if (newFOIRPercentage <= 30) eligibilityScore += 25;
        else if (newFOIRPercentage <= 40) eligibilityScore += 20;
        else if (newFOIRPercentage <= 50) eligibilityScore += 12;
        else if (newFOIRPercentage <= 60) eligibilityScore += 5;
        else eligibilityScore += 0;

        // Income adequacy (0-20 points)
        const incomeToEMI = disposableIncome / estimatedEMI;
        if (incomeToEMI >= 3) eligibilityScore += 20;
        else if (incomeToEMI >= 2) eligibilityScore += 15;
        else if (incomeToEMI >= 1.5) eligibilityScore += 10;
        else if (incomeToEMI >= 1) eligibilityScore += 5;
        else eligibilityScore += 0;

        // Employment stability (0-15 points)
        if (empType === 'employed' || empType === 'salaried') eligibilityScore += 15;
        else if (empType === 'self-employed') eligibilityScore += 12;
        else if (empType === 'business') eligibilityScore += 10;
        else if (empType === 'student') eligibilityScore += 5;
        else eligibilityScore += 2;

        // Loan amount reasonableness (0-10 points)
        const loanToIncome = amount / (income * 12);
        if (loanToIncome <= 2) eligibilityScore += 10;
        else if (loanToIncome <= 4) eligibilityScore += 7;
        else if (loanToIncome <= 6) eligibilityScore += 4;
        else eligibilityScore += 1;

        // 6. Approval probability
        let approvalProbability;
        if (eligibilityScore >= 80) approvalProbability = 'Very High (85-95%)';
        else if (eligibilityScore >= 65) approvalProbability = 'High (70-85%)';
        else if (eligibilityScore >= 50) approvalProbability = 'Moderate (50-70%)';
        else if (eligibilityScore >= 35) approvalProbability = 'Low (30-50%)';
        else approvalProbability = 'Very Low (< 30%)';

        // 7. Calculate max eligible amount
        const maxEMI = income * 0.4 - emis; // 40% of income minus existing EMIs
        const maxEligibleAmount = maxEMI > 0
            ? Math.round((maxEMI * (Math.pow(1 + monthlyRate, loanTenure) - 1)) / (monthlyRate * Math.pow(1 + monthlyRate, loanTenure)))
            : 0;

        // 8. Generate suggestions
        const suggestions = [];
        if (credit < 750) {
            suggestions.push('Improve your credit score to 750+ by paying bills on time and reducing credit card usage');
        }
        if (newFOIRPercentage > 40) {
            suggestions.push('Reduce existing EMIs or debts to improve your FOIR ratio below 40%');
        }
        if (amount > maxEligibleAmount && maxEligibleAmount > 0) {
            suggestions.push(`Consider reducing loan amount to ₹${maxEligibleAmount.toLocaleString('en-IN')} for better chances`);
        }
        if (empType === 'self-employed' || empType === 'business') {
            suggestions.push('Keep 2-3 years of ITR ready to strengthen your application');
        }
        if (disposableIncome < estimatedEMI * 1.5) {
            suggestions.push('Consider a longer tenure to reduce monthly EMI burden');
        }
        if (suggestions.length === 0) {
            suggestions.push('Your profile looks strong! Proceed with the application.');
        }

        res.json({
            eligibilityScore: Math.min(100, eligibilityScore),
            approvalProbability,
            suggestions,
            eligibleAmount: maxEligibleAmount,
            details: {
                monthlyIncome: income,
                existingEMIs: emis,
                disposableIncome,
                estimatedEMI,
                currentFOIR: `${foirPercentage}%`,
                projectedFOIR: `${newFOIRPercentage}%`,
                creditScore: credit,
                employmentType: empType,
                requestedAmount: amount,
                estimatedRate: `${annualRate}%`
            }
        });
    } catch (error) {
        console.error('Eligibility Calculation Error:', error);
        res.status(500).json({ message: 'Failed to calculate eligibility' });
    }
});

module.exports = router;
