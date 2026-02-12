const fs = require('fs');
const i18next = require('i18next');
const Backend = require('i18next-fs-backend');
const path = require('path');
const { GoogleGenerativeAI } = require("@google/generative-ai");
const OpenAI = require("openai");

const genAI = process.env.GEMINI_API_KEY ? new GoogleGenerativeAI(process.env.GEMINI_API_KEY) : null;
const openai = process.env.OPENAI_API_KEY ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY }) : null;

// Initialize i18next
i18next
    .use(Backend)
    .init({
        fallbackLng: 'en',
        lng: 'en',
        preload: ['en', 'hi', 'ta', 'te'],
        backend: {
            loadPath: path.join(__dirname, '../locales/{{lng}}.json')
        }
    });

const SYSTEM_PROMPT = `You are FinBridge AI, a smart financial advisor for Indian users.
Your goal is to help users find the right loans and government schemes.

### RESPONSE FORMAT
You MUST allow respond in valid JSON format with this structure:
{
  "text": "Natural language response here...",
  "structured": {
    "type": "loan_recommendation", // or 'eligibility_check', 'general_info'
    "loanType": "Home Loan", // or Personal, Education, Business, etc.
    "eligibleAmount": 500000,
    "estimatedEMI": 12000,
    "interestRate": "8.5%",
    "tenure": "5 years",
    "eligibilityScore": 85, // 0-100
    "suggestedScheme": "PMAY - CLSS",
    "tips": ["Tip 1", "Tip 2"]
  }
}
If no structured data is needed (just chatting), return "structured": null.

### GUIDELINES
1. **Ask one question at a time** if you need more info (Income, EMI, Employment).
2. **Calculate Eligibility**:
   - FOIR = (Existing EMI + New EMI) / Monthly Income
   - Healthy FOIR is < 50%
   - Disposable Income = Income - Existing EMI
3. **Be empathetic**: Use simple language.
4. **Schemes**: Suggest PMAY for home, Mudra for business, Vidya Lakshmi for education.
5. **Languages**: Respond in the language user speaks (English, Hindi, Tamil, Telugu).

### CURRENT CONTEXT
User Language: {{LANG}}
`;

class AIService {
    async processMessage(text, lang, context = {}, history = []) {
        // Enforce language
        if (i18next.language !== lang) await i18next.changeLanguage(lang);

        const langName = { en: 'English', hi: 'Hindi', ta: 'Tamil', te: 'Telugu' }[lang] || 'English';
        const updatedSystemPrompt = SYSTEM_PROMPT.replace('{{LANG}}', langName);

        // 1. Try OpenAI (Primary)
        if (openai) {
            try {
                return await this.callOpenAI(text, updatedSystemPrompt, history);
            } catch (err) {
                console.error("OpenAI Failed:", err.message);
            }
        }

        // 2. Try Gemini (Fallback)
        if (genAI) {
            try {
                return await this.callGemini(text, updatedSystemPrompt, history);
            } catch (err) {
                console.error("Gemini Failed:", err.message);
            }
        }

        // 3. Last Resort Fallback
        return {
            content: {
                text: "I'm having trouble connecting to my brain right now. Please try again in a moment.",
                structured: null
            },
            role: 'assistant',
            context
        };
    }

    async callOpenAI(text, systemPrompt, history) {
        const messages = [
            { role: "system", content: systemPrompt },
            ...history.slice(-6).map(m => ({ // Keep last 6 messages
                role: m.role === 'assistant' ? 'assistant' : 'user',
                content: typeof m.content === 'string' ? m.content : JSON.stringify(m.content)
            })),
            { role: "user", content: text }
        ];

        const completion = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages,
            response_format: { type: "json_object" },
            temperature: 0.7,
        });

        let content = JSON.parse(completion.choices[0].message.content);
        return { content, role: 'assistant', context: {} };
    }

    async callGemini(text, systemPrompt, history) {
        const modelsToTry = [
            "gemini-1.5-flash",
            "gemini-1.5-pro",
            "gemini-pro"
        ];

        let lastError = null;

        for (const modelName of modelsToTry) {
            try {
                // Configure model - only use JSON mode for 1.5 models
                const config = {
                    model: modelName,
                };

                // Only 1.5 models reliably support JSON mode via config
                if (modelName.includes("1.5")) {
                    config.generationConfig = { responseMimeType: "application/json" };
                }

                const model = genAI.getGenerativeModel(config);

                // For gemini-pro (legacy), we might need to be more careful with system prompt
                // But the SDK handles system instructions in recent versions for 1.5 too.
                // Let's stick to the chat history seeding approach as it works generally.

                const chat = model.startChat({
                    history: [
                        { role: "user", parts: [{ text: systemPrompt }] },
                        { role: "model", parts: [{ text: "Understood. I will respond in JSON if possible, or plain text." }] },
                        ...history.slice(-6).map(m => ({
                            role: m.role === 'assistant' ? 'model' : 'user',
                            parts: [{ text: typeof m.content === 'string' ? m.content : JSON.stringify(m.content) }]
                        }))
                    ]
                });

                const result = await chat.sendMessage(text);
                const responseText = result.response.text();

                try {
                    const content = JSON.parse(responseText);
                    return { content, role: 'assistant', context: {} };
                } catch (e) {
                    // If JSON parse fails (e.g. gemini-pro returning text), try to extract JSON or just return text
                    console.warn(`Gemini ${modelName} returned non-JSON:`, responseText.substring(0, 50));

                    // Basic fallback: if it looks like JSON, try to fix?
                    // Or just wrap it in our structure
                    return {
                        content: {
                            text: responseText,
                            structured: null
                        },
                        role: 'assistant',
                        context: {}
                    };
                }

            } catch (err) {
                console.error(`Gemini model ${modelName} failed:`, err.message);
                try { fs.appendFileSync('error.log', `Gemini ${modelName} Error: ${err.message}\n`); } catch (e) { }
                lastError = err;
                // Continue to next model
            }
        }

        throw lastError || new Error("All Gemini models failed");
    }
}

module.exports = new AIService();
