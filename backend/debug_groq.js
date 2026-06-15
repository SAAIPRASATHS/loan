require('dotenv').config();
const Groq = require('groq-sdk');

async function testGroq() {
    console.log("Testing Groq API...");
    console.log("API Key loaded:", process.env.GROQ_API_KEY ? "Yes" : "No");
    console.log("Model:", process.env.GROQ_MODEL);

    if (!process.env.GROQ_API_KEY) {
        console.error("Missing GROQ_API_KEY");
        return;
    }

    const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

    try {
        const chatCompletion = await groq.chat.completions.create({
            messages: [{ role: "user", content: "Hello" }],
            model: process.env.GROQ_MODEL || "llama-3.1-8b-instant",
        });
        console.log("Response:", chatCompletion.choices[0].message.content);
    } catch (error) {
        console.error("Groq Error Details:", error);
    }
}

testGroq();
