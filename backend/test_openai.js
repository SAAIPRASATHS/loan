require('dotenv').config();
const aiService = require('./services/aiService');

async function testOpenAI() {
    console.log("Testing OpenAI Integration...");
    try {
        const response = await aiService.processMessage("I am looking for an education loan of 5 lakhs", "en");
        console.log("AI Response:", response.content);
        console.log("Role:", response.role);
        console.log("Context:", response.context);

        if (response.content && response.content.length > 0) {
            console.log("✅ OpenAI Integration Verified!");
        } else {
            console.log("❌ OpenAI Integration Failed: Empty response");
        }
    } catch (error) {
        console.error("❌ OpenAI Integration Failed:", error.message);
    }
}

testOpenAI();
