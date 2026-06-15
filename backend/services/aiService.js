require('dotenv').config();
const i18next = require('i18next');
const Backend = require('i18next-fs-backend');
const path = require('path');
const Groq = require('groq-sdk');
let groq;

function getGroqClient() {
    if (!groq && process.env.GROQ_API_KEY) {
        console.log('[AI_SERVICE] Initializing Groq client with provided API key...');
        groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
    }
    
    if (!groq) {
        console.error('[AI_SERVICE] CRITICAL ERROR: process.env.GROQ_API_KEY is missing!');
        throw new Error('AI Service not configured');
    }
    
    return groq;
}

const prisma = require('../prisma/client');

i18next
    .use(Backend)
    .init({
        fallbackLng: 'en',
        lng: 'en',
        preload: ['en', 'hi', 'ta'],
        backend: {
            loadPath: path.join(__dirname, '../locales/{{lng}}.json')
        }
    });

class AIService {
    async processMessage(text, lang, history = [], context = {}) {
        const input = text.toLowerCase();
        const detectedLang = this.detectScript(text);
        const activeLang = detectedLang || lang || 'en';

        if (i18next.language !== activeLang) {
            await i18next.changeLanguage(activeLang);
        }

        try {
            const groqResponse = await this.getGroqResponse(text, activeLang, history, context);
            return { ...groqResponse, activeLang };
        } catch (error) {
            console.error("Groq Error:", error.message);
            return {
                content: "I'm having trouble connecting to my AI brain. Please try again.",
                role: 'assistant',
                activeLang,
                context
            };
        }
    }

    async getGroqResponse(text, lang, history, context) {
        const model = process.env.GROQ_MODEL || "llama-3.1-8b-instant";

        const availableLoans = await prisma.loan.findMany({ where: { isActive: true } });
        const loanContext = availableLoans.map(l => {
            return `PRODUCT: [${l.loanType}] | SYSTEM_ID: ${l.id} | MinIncome: ${l.minIncome} | MinCIBIL: ${l.minCreditScore} | Age: ${l.minAge}-${l.maxAge}`;
        }).join('\n');

        const availableSchemes = await prisma.scheme.findMany({ where: { isActive: true } });
        const schemeContext = availableSchemes.map(s => {
            return `Scheme: ${s.nameEn} | URL: ${s.portalUrl}`;
        }).join('\n');

        const systemPrompt = `You are a professional Loan Advisor.
        
        CRITICAL RULES:
        1. NEVER ASSUME or HALLUCINATE values for Age, Monthly Income, or CIBIL Score. 
        2. If any of these 3 items (Age, Income, CIBIL) are missing from the conversation history, you MUST ASK the user for them.
        3. DO NOT give an eligibility verdict until you have real numbers for all three.
        4. If a user asks "how to apply" without providing details, explain that they can either provide details here OR go to their "Dashboard" and click "Check Eligibility" on any loan card to fill out the form manually.
        5. Always respond in ${lang === 'hi' ? 'Hindi' : lang === 'ta' ? 'Tamil' : 'English'}.
        
        MANDATORY RESPONSE STRUCTURE (Only use when giving a verdict):
        1. **Verdict**: (Eligible/Ineligible)
        2. **Math Explanation**: (Explain using the numbers)
        3. **Action Plan**: (Instructions)
        4. **Government Scheme**: (Recommendation with URL)
        5. **System Code**: [[ELIGIBILITY_RESULT:status:SYSTEM_ID]] (NO SPACES)
        
        Available Products:
        ${loanContext}

        Available Schemes:
        ${schemeContext}`;

        const messages = [
            { role: "system", content: systemPrompt },
            ...(history || []).map(msg => ({
                role: (msg.role === 'assistant' ? 'assistant' : 'user'),
                content: msg.content
            })),
            { role: "user", content: text }
        ];

        const client = getGroqClient();

        const chatCompletion = await client.chat.completions.create({
            messages: messages,
            model: model,
            temperature: 0,
            max_tokens: 1024
        });

        return {
            content: chatCompletion.choices[0].message.content,
            role: 'assistant',
            context: { ...context, currentIntent: "ai_handled" }
        };
    }

    async translateText(text, targetLang) {
        const client = getGroqClient();
        const chatCompletion = await client.chat.completions.create({
            messages: [
                { role: "system", content: "Translate the following text. Return ONLY the translation." },
                { role: "user", content: `Translate to ${targetLang}: ${text}` }
            ],
            model: process.env.GROQ_MODEL || "llama-3.1-8b-instant",
            temperature: 0
        });
        return chatCompletion.choices[0].message.content.trim();
    }

    detectScript(text) {
        const lower = text.toLowerCase();
        if (lower.includes('english')) return 'en';
        if (lower.includes('தமிழ்')) return 'ta';
        if (lower.includes('हिंदी')) return 'hi';
        if (/[\u0B80-\u0BFF]/.test(text)) return 'ta';
        if (/[\u0900-\u097F]/.test(text)) return 'hi';
        return 'en';
    }
}

module.exports = new AIService();
