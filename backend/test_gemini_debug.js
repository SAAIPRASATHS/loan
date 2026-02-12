const { GoogleGenerativeAI } = require("@google/generative-ai");
require("dotenv").config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function run() {
    try {
        console.log("Listing models...");
        // For listing models, we don't need a specific model instance
        // But the SDK doesn't expose listModels directly easily in 0.24?
        // Wait, it does via `genAI.getGenerativeModel`. But listing?
        // Actually, usually it's not exposed on the client directly in the node SDK this way easily for listing ALL.
        // Let's just try to invoke 'gemini-1.5-flash' with a simple prompt.

        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        const result = await model.generateContent("Hello?");
        console.log("Success with gemini-1.5-flash:", result.response.text());
    } catch (error) {
        console.error("Error with gemini-1.5-flash:", error.message);
    }

    try {
        const model = genAI.getGenerativeModel({ model: "gemini-pro" });
        const result = await model.generateContent("Hello?");
        console.log("Success with gemini-pro:", result.response.text());
    } catch (error) {
        console.error("Error with gemini-pro:", error.message);
    }
}

run();
