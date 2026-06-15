const mongoose = require('mongoose');

const loanApplicationSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    loan: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Loan',
        required: true
    },
    requestedAmount: {
        type: Number,
        required: true
    },
    requestedTenure: {
        type: Number,
        required: true
    },
    purpose: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ['draft', 'submitted', 'under-review', 'approved', 'rejected', 'disbursed'],
        default: 'draft'
    },
    documents: [{
        documentType: String,
        fileName: String,
        filePath: String,
        uploadedAt: {
            type: Date,
            default: Date.now
        }
    }],
    eligibilityScore: {
        type: Number,
        min: 0,
        max: 100
    },
    eligibilityDetails: {
        ageEligible: Boolean,
        incomeEligible: Boolean,
        creditScoreEligible: Boolean,
        employmentEligible: Boolean,
        existingLoansEligible: Boolean
    },
    remarks: [{
        message: String,
        createdBy: String,
        createdAt: {
            type: Date,
            default: Date.now
        }
    }],
    approvedAmount: Number,
    approvedTenure: Number,
    interestRate: Number,
    disbursementDate: Date
}, {
    timestamps: true
});

module.exports = mongoose.model('LoanApplication', loanApplicationSchema);
