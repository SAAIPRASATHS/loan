const aiService = require('./services/aiService');
const mongoose = require('mongoose');
require('dotenv').config();

async function testAILogic() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);

        console.log('--- TEST 1: Provide details and check eligibility tag ---');
        const testText = "I want a home loan. My age is 30, income is 50000, and CIBIL is 750.";
        const history = [];

        const response = await aiService.processMessage(testText, 'en', history, {});

        console.log('AI Response Content:');
        console.log(response.content);

        const eligibilityMatch = response.content.match(/\[\[ELIGIBILITY_RESULT\s*:\s*(.*?)\s*:\s*(.*?)(?:\s*:\s*(.*?))?\s*\]\]/);
        if (eligibilityMatch) {
            console.log('Match Found!');
            console.log('Status (match[1]):', `"${eligibilityMatch[1]}"`);
            console.log('Value (match[2]):', `"${eligibilityMatch[2]}"`);
        } else {
            console.log('No tag found!');
        }

        process.exit(0);
    } catch (err) {
        console.error('Test Failed:', err);
        process.exit(1);
    }
}

testAILogic();
