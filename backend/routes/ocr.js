const express = require('express');
const router = express.Router();
const Tesseract = require('tesseract.js');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = path.join(__dirname, '../uploads/ocr');
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        cb(null, `salary_${Date.now()}${path.extname(file.originalname)}`);
    }
});

const upload = multer({
    storage,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
    fileFilter: (req, file, cb) => {
        const allowed = ['.jpg', '.jpeg', '.png', '.pdf', '.bmp', '.tiff'];
        const ext = path.extname(file.originalname).toLowerCase();
        if (allowed.includes(ext)) {
            cb(null, true);
        } else {
            cb(new Error('Only image files (JPG, PNG, BMP, TIFF) and PDF are allowed'));
        }
    }
});

/**
 * Extract salary amount from OCR text
 */
function extractSalaryAmount(text) {
    const patterns = [
        // Net salary / net pay patterns
        /net\s*(?:salary|pay|amount|payable)[:\s]*(?:rs\.?|₹|inr)?\s*([\d,]+(?:\.\d{2})?)/i,
        /(?:take\s*home|in\s*hand)[:\s]*(?:rs\.?|₹|inr)?\s*([\d,]+(?:\.\d{2})?)/i,
        // Gross salary patterns
        /gross\s*(?:salary|pay|earnings)[:\s]*(?:rs\.?|₹|inr)?\s*([\d,]+(?:\.\d{2})?)/i,
        // Total earnings
        /total\s*(?:earnings|income|salary)[:\s]*(?:rs\.?|₹|inr)?\s*([\d,]+(?:\.\d{2})?)/i,
        // Generic salary patterns
        /(?:salary|pay|amount)[:\s]*(?:rs\.?|₹|inr)?\s*([\d,]+(?:\.\d{2})?)/i,
        // Currency followed by amount
        /(?:rs\.?|₹|inr)\s*([\d,]+(?:\.\d{2})?)/i,
        // Standalone large numbers (likely salary)
        /\b(\d{2},\d{2},\d{3}(?:\.\d{2})?)\b/,
        /\b(\d{1,2},\d{3}(?:\.\d{2})?)\b/
    ];

    const amounts = [];

    for (const pattern of patterns) {
        const matches = text.match(pattern);
        if (matches && matches[1]) {
            const amount = parseFloat(matches[1].replace(/,/g, ''));
            if (amount >= 5000 && amount <= 10000000) { // Reasonable salary range
                amounts.push(amount);
            }
        }
    }

    if (amounts.length === 0) return null;

    // Return the most likely salary (often the largest reasonable amount)
    return Math.max(...amounts);
}

// @desc    Process salary slip OCR
// @route   POST /api/ocr
// @access  Public
router.post('/', upload.single('document'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No document file uploaded' });
        }

        const filePath = req.file.path;

        // Perform OCR
        const { data } = await Tesseract.recognize(filePath, 'eng', {
            logger: m => {
                if (m.status === 'recognizing text') {
                    console.log(`OCR Progress: ${Math.round(m.progress * 100)}%`);
                }
            }
        });

        const extractedText = data.text;
        const confidence = data.confidence;
        const salaryAmount = extractSalaryAmount(extractedText);

        // Clean up uploaded file after processing
        try {
            fs.unlinkSync(filePath);
        } catch (e) {
            console.error('Failed to clean up uploaded file:', e);
        }

        const verified = salaryAmount !== null && confidence > 50;

        res.json({
            success: true,
            extractedText: extractedText.substring(0, 1000), // Limit text length
            salaryAmount,
            confidence: Math.round(confidence),
            verified,
            verificationBadge: verified ? 'Income Verified ✓' : 'Verification Pending',
            message: verified
                ? `Successfully extracted salary amount: ₹${salaryAmount.toLocaleString('en-IN')}`
                : 'Could not reliably extract salary. Please upload a clearer image or enter manually.'
        });
    } catch (error) {
        console.error('OCR Processing Error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to process document. Please try again with a clearer image.'
        });
    }
});

module.exports = router;
