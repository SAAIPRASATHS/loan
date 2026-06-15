const mongoose = require('mongoose');
require('dotenv').config();
const aiService = require('./services/aiService');

async function testRejectionAdvice() {
    console.log("Connecting to MongoDB...");
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/loan-advisor');
    console.log("Connected to MongoDB.");

    console.log("Testing Rejection Advice...");
    const testCases = [
        {
            text: "My age is 15, income 5000, CIBIL 500 for a personal loan.",
            lang: "en",
            history: []
        },
        {
            text: "எனக்கு 20 வயது, வருமானம் 5000, சிபில் 400 பார் பெர்சனல் லோன்.",
            lang: "ta",
            history: []
        }
    ];

    for (const test of testCases) {
        console.log(`\nInput (${test.lang}): ${test.text}`);
        try {
            const response = await aiService.processMessage(test.text, test.lang, test.history);
            console.log(`Response: ${response.content}`);
        } catch (error) {
            console.error(`Error: ${error.message}`);
        }
    }
    await mongoose.connection.close();
    console.log("Disconnected from MongoDB.");
}

testRejectionAdvice();
