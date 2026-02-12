const express = require('express');
const router = express.Router();
const LoanApplication = require('../models/LoanApplication');
const { protect } = require('../middleware/auth');
const multer = require('multer');
const path = require('path');

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
        cb(null, `${req.user._id}-${Date.now()}${path.extname(file.originalname)}`);
    }
});

const upload = multer({ storage: storage });

// @desc    Create new loan application
// @route   POST /api/applications
// @access  Private
router.post('/', protect, async (req, res) => {
    try {
        const { loanId, requestedAmount, requestedTenure, purpose } = req.body;

        const application = await LoanApplication.create({
            user: req.user._id,
            loan: loanId,
            requestedAmount,
            requestedTenure,
            purpose,
            status: 'submitted'
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
        const applications = await LoanApplication.find({ user: req.user._id })
            .populate('loan', 'name loanType interestRate');
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
        const application = await LoanApplication.findOne({
            _id: req.params.id,
            user: req.user._id
        });

        if (!application) {
            return res.status(404).json({ message: 'Application not found' });
        }

        application.documents.push({
            documentType: req.body.documentType,
            fileName: req.file.filename,
            filePath: req.file.path
        });

        await application.save();
        res.json(application);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
