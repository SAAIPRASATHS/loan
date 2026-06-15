require('dotenv').config({ path: './.env' });
const mongoose = require('mongoose');
const aiService = require('./services/aiService');

async function verify() {
    await mongoose.connect(process.env.MONGODB_URI);

    // Test Case: The exact failing scenario (30,000 income, 750 CIBIL, 30 Age)
    // The requirement for Personal Loan is 25,000 income, 750 CIBIL.
    const text = "Hi, my income is 30000, age 30, score 750. I want a personal loan.";
    const result = await aiService.processMessage(text, 'en', [], {});

    console.log("--- MATH ACCURACY TEST (30k vs 25k) ---");
    console.log("User Input:", text);
    console.log("AI Response:\n", result.content);

    const isEligible = result.content.toLowerCase().includes('eligible') && !result.content.toLowerCase().includes('ineligible');
    const correctStatement = result.content.toLowerCase().includes('above') || result.content.toLowerCase().includes('meets') || result.content.toLowerCase().includes('higher');

    console.log("\nVerdict Correct (Eligible):", isEligible ? "PASS" : "FAIL");
    console.log("Statement Correct (Above/Meets):", correctStatement ? "PASS" : "FAIL");

    mongoose.connection.close();
}
verify();
