require('dotenv').config();
const aiService = require('./services/aiService');
const mongoose = require('mongoose');

async function testMultilingual() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);

        const scenarios = [
            { name: 'Switch to Hindi', text: 'नमस्ते, क्या आप میری मदद कर सकते हैं?', expectedLang: 'hi' },
            { name: 'Switch to Tamil', text: 'வணக்கம், கடன் பற்றி சொல்லுங்கள்', expectedLang: 'ta' },
            { name: 'Explicit request (English)', text: 'Speak in English from now on', expectedLang: 'en' }
        ];

        for (const scenario of scenarios) {
            console.log(`\nScenario: ${scenario.name}`);
            console.log(`Input: "${scenario.text}"`);

            const response = await aiService.processMessage(scenario.text, 'en', [], {});
            console.log(`Detected Lang: ${response.activeLang}`);
            console.log(`Response Snippet: ${response.content.substring(0, 100)}...`);

            if (response.activeLang !== scenario.expectedLang) {
                console.error(`FAILED: Expected ${scenario.expectedLang}, got ${response.activeLang}`);
            } else {
                console.log('PASSED');
            }
        }

        process.exit(0);
    } catch (err) {
        console.error('Test Failed:', err.message);
        process.exit(1);
    }
}

testMultilingual();
