const aiService = require('./services/aiService');
const mongoose = require('mongoose');
require('dotenv').config();

async function testAI() {
    try {
        console.log('Testing AI with model:', process.env.GROQ_MODEL);

        // Connect to DB for loan context
        await mongoose.connect(process.env.MONGODB_URI);

        const testMessage = 'educational loan';
        const history = [{ role: 'user', content: testMessage }];

        const response = await aiService.processMessage(testMessage, 'en', history, {});

        console.log('\nAI Response:');
        console.log('-------------------');
        console.log(response.content);
        console.log('-------------------');

        process.exit(0);
    } catch (err) {
        console.error('Test Failed:', err.message);
        process.exit(1);
    }
}

testAI();
