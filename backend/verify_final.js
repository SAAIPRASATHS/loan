require('dotenv').config({ path: './.env' });
const mongoose = require('mongoose');
const aiService = require('./services/aiService');

async function verify() {
    await mongoose.connect(process.env.MONGODB_URI);

    // Scenario: User provided all data in one go, extremely ineligible.
    const text = "Hi, I am 35. My income is only 3000 and my CIBIL is 400. I want a business loan. Why am I not getting it and how to improve? Also give me links for any govt schemes.";
    const result = await aiService.processMessage(text, 'en', [], {});

    console.log("--- FINAL COMPREHENSIVE ADVISOR TEST ---");
    console.log("AI Response:\n", result.content);

    const hasVerdict = result.content.toLowerCase().includes('ineligible');
    const hasMath = result.content.includes('3000');
    const hasTips = result.content.toLowerCase().includes('improve') || result.content.toLowerCase().includes('tips') || result.content.toLowerCase().includes('plan');
    const hasUrl = result.content.includes('http');

    console.log("\nVerdict Status:", hasVerdict ? "PASS" : "FAIL");
    console.log("Explanation Math:", hasMath ? "PASS" : "FAIL");
    console.log("Improvement Tips:", hasTips ? "PASS" : "FAIL");
    console.log("Portal Link:", hasUrl ? "PASS" : "FAIL");

    mongoose.connection.close();
}
verify();
