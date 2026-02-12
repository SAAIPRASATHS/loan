const express = require('express');
const router = express.Router();
const Loan = require('../models/Loan');
const { protect } = require('../middleware/auth');
const { calculateEligibility } = require('../services/eligibilityService');

// @desc    Get all loans
// @route   GET /api/loans
// @access  Public
router.get('/', async (req, res) => {
    try {
        const loans = await Loan.find({ isActive: true });
        res.json(loans);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @desc    Get loan by ID
// @route   GET /api/loans/:id
// @access  Public
router.get('/:id', async (req, res) => {
    try {
        const loan = await Loan.findById(req.params.id);
        if (loan) {
            res.json(loan);
        } else {
            res.status(404).json({ message: 'Loan not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @desc    Check eligibility for a loan
// @route   POST /api/loans/:id/check-eligibility
// @access  Private
router.post('/:id/check-eligibility', protect, async (req, res) => {
    try {
        const loan = await Loan.findById(req.params.id);
        if (!loan) {
            return res.status(404).json({ message: 'Loan not found' });
        }

        const userProfile = req.user.financialProfile;
        if (!userProfile || !userProfile.monthlyIncome) {
            return res.status(400).json({ message: 'Please complete your financial profile first' });
        }

        const eligibility = calculateEligibility(userProfile, loan.eligibilityCriteria);

        res.json({
            loanId: loan._id,
            loanName: loan.name,
            ...eligibility
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
