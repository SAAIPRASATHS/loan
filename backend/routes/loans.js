const express = require('express');
const router = express.Router();
const prisma = require('../prisma/client');
const { protect } = require('../middleware/auth');
const { calculateEligibility } = require('../services/eligibilityService');

// @desc    Get all loans
// @route   GET /api/loans
// @access  Public
router.get('/', async (req, res) => {
    try {
        const loans = await prisma.loan.findMany({ where: { isActive: true } });
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
        const loan = await prisma.loan.findUnique({ where: { id: req.params.id } });
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
        const loan = await prisma.loan.findUnique({ where: { id: req.params.id } });
        if (!loan) {
            return res.status(404).json({ message: 'Loan not found' });
        }

        // user profile fields are flattened on req.user now
        const userProfile = req.user;
        if (!userProfile || !userProfile.monthlyIncome) {
            return res.status(400).json({ message: 'Please complete your financial profile first' });
        }

        // Loan criteria are now flattened on the loan object in Prisma
        const eligibility = calculateEligibility(userProfile, loan);

        res.json({
            loanId: loan.id,
            loanName: loan.nameEn, // or handle language preference appropriately
            ...eligibility
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @desc    Create a new loan (Agent only)
// @route   POST /api/loans
// @access  Private
router.post('/', protect, async (req, res) => {
    try {
        if (req.user.role !== 'agent') {
            return res.status(403).json({ message: 'Only agents can create loan products' });
        }
        const loan = await prisma.loan.create({
            data: req.body
        });
        res.status(201).json(loan);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
