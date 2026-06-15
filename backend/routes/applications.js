const express = require('express');
const router = express.Router();
const prisma = require('../prisma/client');
const { sendLoanApprovalEmail } = require('../services/emailService');
const { protect } = require('../middleware/auth');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configure multer for file uploads
const uploadDir = process.env.VERCEL === '1' ? '/tmp' : path.join(__dirname, '../uploads');

// Ensure directory exists
if (!fs.existsSync(uploadDir)) {
    try {
        fs.mkdirSync(uploadDir, { recursive: true });
    } catch (err) {
        console.error('Error creating upload directory:', err);
    }
}

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        cb(null, `${req.user.id}-${Date.now()}${path.extname(file.originalname)}`);
    }
});

const upload = multer({ storage: storage });

// @desc    Create new loan application
// @route   POST /api/applications
// @access  Private
router.post('/', protect, async (req, res) => {
    try {
        const {
            loanId, requestedAmount, requestedTenure, purpose,
            borrowerAge, monthlyIncome, creditScore,
            hasCollateral, collateralDetails, requirementsMet,
            aadharNumber
        } = req.body;

        // Fetch loan details for validation
        const loanData = await prisma.loan.findUnique({ where: { id: loanId } });
        if (!loanData) {
            return res.status(404).json({ message: 'Loan product not found' });
        }

        // Calculate eligibility for agent reference (NO auto-approval)
        const ageValid = borrowerAge >= loanData.minAge && borrowerAge <= loanData.maxAge;
        const incomeValid = monthlyIncome >= loanData.minIncome;
        const creditValid = creditScore >= loanData.minCreditScore;

        const application = await prisma.loanApplication.create({
            data: {
                userId: req.user.id,
                loanId: loanId,
                requestedAmount,
                requestedTenure,
                purpose,
                borrowerAge,
                monthlyIncome,
                creditScore,
                hasCollateral: hasCollateral || false,
                collateralDetails,
                aadharNumber,
                status: 'submitted', // Always submitted — agent must review
                
                // Mapped to specific flattened schema columns
                ageEligible: ageValid,
                incomeEligible: incomeValid,
                creditScoreEligible: creditValid,
                employmentEligible: true,
                existingLoansEligible: true
            }
        });

        res.status(201).json(application);

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @desc    Get user's loan applications
// @route   GET /api/applications/my-applications
// @access  Private
router.get('/my-applications', protect, async (req, res) => {
    try {
        const applications = await prisma.loanApplication.findMany({
            where: { userId: req.user.id },
            include: {
                loan: {
                    select: {
                        nameEn: true,
                        loanType: true,
                        interestRateMin: true
                    }
                }
            }
        });
        res.json(applications);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @desc    Upload documents for application
// @route   POST /api/applications/:id/upload
// @access  Private
router.post('/:id/upload', protect, upload.single('document'), async (req, res) => {
    try {
        const application = await prisma.loanApplication.findUnique({
            where: { id: req.params.id }
        });

        if (!application || application.userId !== req.user.id) {
            return res.status(404).json({ message: 'Application not found or unauthorized' });
        }

        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }

        const newDoc = {
            documentType: req.body.documentType,
            fileName: req.file.filename,
            filePath: req.file.path,
            uploadedAt: new Date().toISOString()
        };

        const existingDocs = application.documents ? application.documents : [];
        const updatedDocs = [...existingDocs, newDoc];

        const updatedApplication = await prisma.loanApplication.update({
            where: { id: application.id },
            data: { documents: updatedDocs }
        });

        res.json(updatedApplication);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @desc    Delete a loan application
// @route   DELETE /api/applications/:id
// @access  Private
router.delete('/:id', protect, async (req, res) => {
    try {
        const application = await prisma.loanApplication.findUnique({ where: { id: req.params.id } });

        if (!application) {
            return res.status(404).json({ message: 'Application not found' });
        }

        const isOwner = application.userId === req.user.id;
        const isAgent = application.agentId === req.user.id;
        const isUnassignedAgent = req.user.role === 'agent' && !application.agentId;

        if (!isOwner && !isAgent && !isUnassignedAgent && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Not authorized to delete this application' });
        }

        await prisma.loanApplication.delete({ where: { id: req.params.id } });

        res.json({ message: 'Application removed successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
