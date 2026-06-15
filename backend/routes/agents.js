const express = require('express');
const router = express.Router();
const prisma = require('../prisma/client');
const { protect } = require('../middleware/auth');

// @desc    Get agent dashboard stats
// @route   GET /api/agents/dashboard
// @access  Private (Agent only)
router.get('/dashboard', protect, async (req, res) => {
    try {
        if (req.user.role !== 'agent' && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Access denied. Agent/Admin role required.' });
        }

        const agentProfile = await prisma.agentProfile.findUnique({ where: { userId: req.user.id } });

        // Admin sees all leads, Agent sees theirs + unassigned
        const query = req.user.role === 'admin' ? {} : {
            OR: [
                { agentId: req.user.id },
                { agentId: null }
            ]
        };

        const leads = await prisma.loanApplication.findMany({
            where: query,
            include: {
                user: { select: { name: true, email: true, phone: true } },
                loan: { select: { nameEn: true, loanType: true } }
            }
        });

        res.json({
            profile: agentProfile,
            leads: leads,
            stats: {
                totalLeads: leads.length,
                approvedLeads: leads.filter(l => l.status === 'approved').length,
                pendingLeads: leads.filter(l => ['submitted', 'under_review'].includes(l.status)).length
            }
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @desc    Submit a new loan lead
// @route   POST /api/agents/leads
// @access  Private (Agent only)
router.post('/leads', protect, async (req, res) => {
    try {
        if (req.user.role !== 'agent' && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Access denied. Agent or Admin role required.' });
        }

        const { borrowerId, loanId, requestedAmount, requestedTenure, purpose } = req.body;

        const application = await prisma.loanApplication.create({
            data: {
                userId: borrowerId,
                loanId: loanId,
                agentId: req.user.id,
                isAgentSubmission: true,
                requestedAmount,
                requestedTenure,
                purpose,
                status: 'submitted'
            }
        });

        // Update agent stats
        await prisma.agentProfile.update({
            where: { userId: req.user.id },
            data: { totalLeadsSubmitted: { increment: 1 } }
        });

        res.status(201).json(application);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @desc    Register agent profile
// @route   POST /api/agents/profile
// @access  Private (Agent only)
router.post('/profile', protect, async (req, res) => {
    try {
        if (req.user.role !== 'agent' && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Access denied. Agent or Admin role required.' });
        }

        const { agencyName, licenseNumber, experience, specializations } = req.body;

        const profileExists = await prisma.agentProfile.findUnique({ where: { userId: req.user.id } });
        if (profileExists) {
            return res.status(400).json({ message: 'Agent profile already exists' });
        }

        const agentProfile = await prisma.agentProfile.create({
            data: {
                userId: req.user.id,
                agencyName,
                licenseNumber,
                experience,
                specializations
            }
        });

        res.status(201).json(agentProfile);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @desc    Get single lead details
// @route   GET /api/agents/leads/:id
// @access  Private (Agent only)
router.get('/leads/:id', protect, async (req, res) => {
    try {
        if (req.user.role !== 'agent' && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Access denied. Agent or Admin role required.' });
        }

        const application = await prisma.loanApplication.findUnique({
            where: { id: req.params.id },
            include: {
                user: { select: { name: true, email: true, phone: true, monthlyIncome: true, employmentStatus: true, creditScore: true } },
                loan: true,
                reviewedBy: { select: { name: true, email: true } }
            }
        });

        if (!application) {
            return res.status(404).json({ message: 'Application not found' });
        }

        res.json(application);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @desc    Approve or reject a loan application
// @route   PUT /api/agents/leads/:id/review
// @access  Private (Agent only)
router.put('/leads/:id/review', protect, async (req, res) => {
    try {
        if (req.user.role !== 'agent' && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Access denied. Agent or Admin role required.' });
        }

        const { action, remarks, approvedAmount, interestRate } = req.body;

        if (!['approve', 'reject'].includes(action)) {
            return res.status(400).json({ message: 'Action must be "approve" or "reject"' });
        }

        const application = await prisma.loanApplication.findUnique({
            where: { id: req.params.id },
            include: { user: true, loan: true }
        });

        if (!application) {
            return res.status(404).json({ message: 'Application not found' });
        }

        if (application.status === 'approved' || application.status === 'rejected') {
            return res.status(400).json({ message: `Application already ${application.status}` });
        }

        const updateData = {
            status: action === 'approve' ? 'approved' : 'rejected',
            reviewedById: req.user.id,
            reviewedAt: new Date(),
            agentId: req.user.id
        };

        if (action === 'approve') {
            updateData.approvedAmount = approvedAmount || application.requestedAmount;
            updateData.interestRate = interestRate || null;
        } else {
            updateData.rejectionReason = remarks || 'Application rejected by agent';
        }

        if (remarks) {
            const existingRemarks = application.remarks || [];
            updateData.remarks = [
                ...existingRemarks,
                { message: remarks, createdBy: req.user.name || 'Agent', createdAt: new Date() }
            ];
        }

        const updatedApplication = await prisma.loanApplication.update({
            where: { id: application.id },
            data: updateData
        });

        // Send email notification
        try {
            if (action === 'approve') {
                const { sendLoanApprovalEmail } = require('../services/emailService');
                sendLoanApprovalEmail(updatedApplication, application.user, application.loan);
            }
        } catch (emailErr) {
            console.error('Email notification failed:', emailErr.message);
        }

        // Update agent stats
        if (action === 'approve') {
            try {
                await prisma.agentProfile.update({
                    where: { userId: req.user.id },
                    data: { leadsApproved: { increment: 1 } }
                });
            } catch (ignore) {} // ignore if agent profile doesn't exist for some reason
        }

        res.json({ message: `Application ${updatedApplication.status} successfully`, application: updatedApplication });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @desc    Run AI document analysis on application
// @route   POST /api/agents/leads/:id/analyze-documents
// @access  Private (Agent only)
router.post('/leads/:id/analyze-documents', protect, async (req, res) => {
    try {
        if (req.user.role !== 'agent' && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Access denied. Agent or Admin role required.' });
        }
        const aadhaarService = require('../services/aadhaarService');
        
        const application = await prisma.loanApplication.findUnique({
            where: { id: req.params.id },
            include: { user: true, loan: true }
        });

        if (!application) {
            return res.status(404).json({ message: 'Application not found' });
        }

        if (!application.documents || application.documents.length === 0) {
            return res.status(400).json({ message: 'No documents uploaded for this application' });
        }

        // Build document summary for AI analysis
        const docSummary = application.documents.map(d =>
            `- Type: ${d.documentType}, File: ${d.fileName}, Uploaded: ${d.uploadedAt}`
        ).join('\n');

        const Groq = require('groq-sdk');
        const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

        const analysisPrompt = `You are a Senior Loan Underwriter. Perform a rigorous, LOGICALLY CONSISTENT financial analysis.

APPLICANT DATA:
- Name: ${application.user?.name || 'N/A'}
- Monthly Income (I): ₹${application.monthlyIncome || 0}
- Credit Score: ${application.creditScore || 0}
- Requested Loan (L): ₹${application.requestedAmount || 0}
- Loan Purpose: ${application.purpose || 'N/A'}
- Documents: ${docSummary}

BANKING INDUSTRY STANDARDS (Multipliers):
- Low Risk: L/I is 1x to 12x (Repayable in 1 year)
- Moderate Risk: L/I is 13x to 48x
- High Normal: L/I is 49x to 60x (Typical bank limit)
- Extreme/Suspicious: L/I > 60x (e.g., ₹500k loan on ₹4k income is 125x)

LOGIC CHECK RULES:
1. CONSISTENCY: A higher income applicant MUST have a lower or equal risk score compared to a lower income applicant for the same loan amount.
2. VERDICT LOGIC: If income is ₹50,000 and loan is ₹500,000, that is only 10x multiplier. This is mathematically VERY SAFE and must be 'genuine'.
3. MULTIPLIER MATH: Calculate M = L / I. If M <= 60, the financial ratio is standard.

OUTPUT (JSON ONLY):
{
  "calculations": "Explain L/I multiplier math...",
  "logic_verification": "Compare against banking standards...",
  "verdict": "genuine" | "suspicious" | "inconclusive",
  "risk_score": 1-10,
  "details": "Professional explanation for the human agent"
}`;

        const chatCompletion = await groq.chat.completions.create({
            messages: [
                { role: "system", content: "You are a financial logic AI. Output ONLY JSON. No thinking blocks, no markdown. Mathematical consistency is your #1 priority." },
                { role: "user", content: analysisPrompt }
            ],
            model: process.env.GROQ_MODEL || "llama-3.3-70b-versatile",
            temperature: 0.0,
            max_tokens: 1024
        });

        let aiResponse = chatCompletion.choices[0].message.content.trim();
        aiResponse = aiResponse.replace(/^```json/, '').replace(/```$/, '').trim();

        let parsedResponse;
        try {
            parsedResponse = JSON.parse(aiResponse);
            if (parsedResponse.verdict) {
                parsedResponse.verdict = parsedResponse.verdict.toLowerCase().trim();
            }
            const validVerdicts = ['genuine', 'suspicious', 'inconclusive'];
            if (!validVerdicts.includes(parsedResponse.verdict)) {
                parsedResponse.verdict = 'inconclusive';
            }
        } catch (e) {
            console.error('AI JSON Parse Error, falling back to string search:', e.message);
            const content = aiResponse.toLowerCase();
            parsedResponse = {
                verdict: content.includes('suspicious') ? 'suspicious' :
                    content.includes('genuine') ? 'genuine' : 'inconclusive',
                details: aiResponse,
                risk_score: 5
            };
        }

        // --- Aadhaar Verification ---
        let aadharRes = null;
        let updateData = {};
        if (application.aadharNumber) {
            try {
                aadharRes = await aadhaarService.verifyName(application.aadharNumber, application.user?.name || '');
                updateData.aadharVerified = aadharRes.isVerified || false;
                updateData.aadharNameMatch = aadharRes.nameMatchStatus;
                updateData.aadharScore = aadharRes.confidenceScore;
                updateData.aadharVerifiedAt = new Date();
            } catch (aadharErr) {
                console.error('Aadhaar service failed:', aadharErr.message);
            }
        }

        updateData.docAnalyzed = true;
        updateData.docAnalysisResult = parsedResponse.verdict;
        updateData.docAnalysisDetails = parsedResponse.calculations ?
            `CALCULATIONS: ${parsedResponse.calculations}\n\nLOGIC CHECK: ${parsedResponse.logic_verification}\n\nSUMMARY: ${parsedResponse.details || parsedResponse.reasoning || ''}` :
            parsedResponse.details || 'Analysis completed.';
        updateData.docAnalyzedAt = new Date();

        const updatedApplication = await prisma.loanApplication.update({
            where: { id: application.id },
            data: updateData
        });

        res.json({
            verdict: updatedApplication.docAnalysisResult,
            details: updatedApplication.docAnalysisDetails,
            analyzedAt: updatedApplication.docAnalyzedAt,
            aadharVerification: {
                isVerified: updatedApplication.aadharVerified,
                nameMatchStatus: updatedApplication.aadharNameMatch,
                confidenceScore: updatedApplication.aadharScore,
                verifiedAt: updatedApplication.aadharVerifiedAt
            }
        });
    } catch (error) {
        console.error('Document analysis error:', error);
        res.status(500).json({
            message: `Analysis failed: ${error.message}`,
            details: error.stack
        });
    }
});

module.exports = router;
