const mongoose = require('mongoose');
require('dotenv').config();
const User = require('./models/User');
const LoanApplication = require('./models/LoanApplication');
const aadhaarService = require('./services/aadhaarService');
const Groq = require('groq-sdk');

async function testAnalysis(id) {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        const application = await LoanApplication.findById(id)
            .populate('user', 'name email phone')
            .populate('loan', 'name loanType');

        if (!application) {
            console.error('Application not found');
            return;
        }

        console.log('Found application:', application._id);

        if (!application.documents || application.documents.length === 0) {
            console.error('No documents');
            return;
        }

        const docSummary = application.documents.map(d =>
            `- Type: ${d.documentType}, File: ${d.fileName}, Uploaded: ${d.uploadedAt}`
        ).join('\n');

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

        console.log('Calling Groq...');
        const chatCompletion = await groq.chat.completions.create({
            messages: [
                { role: "system", content: "You are a financial logic AI. Output ONLY JSON. No thinking blocks, no markdown. Mathematical consistency is your #1 priority." },
                { role: "user", content: analysisPrompt }
            ],
            model: process.env.GROQ_MODEL || "llama-3.1-8b-instant",
            temperature: 0.0,
            max_tokens: 1024
        });

        let aiResponse = chatCompletion.choices[0].message.content.trim();
        console.log('AI Response:', aiResponse);

        aiResponse = aiResponse.replace(/^```json/, '').replace(/```$/, '').trim();

        let parsedResponse;
        try {
            parsedResponse = JSON.parse(aiResponse);
        } catch (e) {
            console.error('AI JSON Parse Error:', e.message);
            parsedResponse = {
                verdict: aiResponse.toLowerCase().includes('suspicious') ? 'suspicious' :
                    aiResponse.toLowerCase().includes('genuine') ? 'genuine' : 'inconclusive',
                details: aiResponse,
                risk_score: 5
            };
        }

        console.log('Parsed Verdict:', parsedResponse.verdict);

        // --- Aadhaar Verification ---
        let aadharRes = null;
        if (application.aadharNumber) {
            console.log('Verifying Aadhaar...');
            aadharRes = await aadhaarService.verifyName(application.aadharNumber, application.user?.name || '');
            application.aadharVerification = {
                isVerified: true,
                nameMatchStatus: aadharRes.nameMatchStatus,
                confidenceScore: aadharRes.confidenceScore,
                verifiedAt: new Date()
            };
        }

        application.documentAnalysis = {
            isAnalyzed: true,
            analysisResult: parsedResponse.verdict,
            analysisDetails: parsedResponse.calculations ?
                `CALCULATIONS: ${parsedResponse.calculations}\n\nLOGIC CHECK: ${parsedResponse.logic_verification}\n\nSUMMARY: ${parsedResponse.details}` :
                parsedResponse.details,
            analyzedAt: new Date()
        };

        console.log('Saving application...');
        await application.save();
        console.log('Saved successfully!');

        await mongoose.disconnect();
    } catch (err) {
        console.error('Test Error:', err);
    }
}

testAnalysis('69943726f55d2263bd9c4a1b');
