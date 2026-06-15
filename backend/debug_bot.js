const aiService = require('./services/aiService');
const mongoose = require('mongoose');
const Loan = require('./models/Loan');
require('dotenv').config();

async function debugAI() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);

        const loans = await Loan.find({ isActive: true });
        console.log('--- SYSTEM IDs IN DB ---');
        loans.forEach(l => console.log(`${l.loanType}: ${l._id}`));

        const testText = "I want a personal loan. My income is 50000, CIBIL 800, age 30.";
        console.log(`\n--- SENDING MESSAGE: "${testText}" ---`);

        const response = await aiService.processMessage(testText, 'en', [], {});

        console.log('\n--- RAW AI CONTENT ---');
        console.log(response.content);
        console.log('\n--- END RAW CONTENT ---');

        const tagMatch = response.content.match(/\[\[ELIGIBILITY_RESULT.*?\]\]/gi);
        console.log('\nTAGS FOUND:', tagMatch || 'NONE');

        process.exit(0);
    } catch (err) {
        console.error('Debug Failed:', err);
        process.exit(1);
    }
}

debugAI();
