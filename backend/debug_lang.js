const tanglishKeywords = ['vanakkam', 'kadan', 'panam', 'pesu', 'enaku', 'venum', 'vaanga', 'eppadi'];
const hinglishKeywords = ['namaste', 'paisa', 'bolo', 'bahut', 'aap', 'kya', 'chahiye', 'kaise', 'hai', 'mein'];

function detectScript(text) {
    const lower = text.toLowerCase().trim();
    console.log(`Input: "${text}"`);

    // 1. Explicit keywords
    if (lower.startsWith('talk in english') || lower.includes('speak in english') || (lower.includes('english') && lower.length < 15)) {
        console.log('Matched explicit English');
        return 'en';
    }
    if (lower.startsWith('talk in tamil') || lower.startsWith('tamilil pesu') || lower.includes('தமிழ்')) {
        console.log('Matched explicit Tamil');
        return 'ta';
    }
    if (lower.startsWith('talk in hindi') || lower.startsWith('hindi mein bolo') || lower.includes('हिंदी')) {
        console.log('Matched explicit Hindi');
        return 'hi';
    }

    // 2. Script-based
    const tamilRegex = /[\u0B80-\u0BFF]/;
    const hindiRegex = /[\u0900-\u097F]/;

    if (tamilRegex.test(text)) {
        console.log('Matched Tamil script');
        return 'ta';
    }
    if (hindiRegex.test(text)) {
        console.log('Matched Hindi script');
        return 'hi';
    }

    // 3. Latin-script detection
    const commonEnglishWords = ['i', 'the', 'a', 'want', 'need', 'me', 'my', 'can', 'hello', 'help', 'loan', 'advisor', 'please'];

    const words = lower.split(/[^a-z]+/);
    console.log('Words:', words);

    const taCount = words.filter(w => tanglishKeywords.includes(w)).length;
    const hiCount = words.filter(w => hinglishKeywords.includes(w)).length;
    const enCount = words.filter(w => commonEnglishWords.includes(w)).length;

    console.log(`taCount: ${taCount}, hiCount: ${hiCount}, enCount: ${enCount}`);

    if (enCount > 0 && enCount >= taCount && enCount >= hiCount) return 'en';
    if (taCount > 0 && taCount >= hiCount) return 'ta';
    if (hiCount > 0) return 'hi';

    if (lower.length > 0 && !/[a-z]/.test(lower)) return null;

    return 'en';
}

const testInputs = [
    "எனக்கு வீட்டுக் கடன் வேண்டும்",
    "i want vehicle loan",
    "vanakkam",
    "namaste",
    "hi",
    "can you help me",
    "loan venum"
];

testInputs.forEach(input => {
    const result = detectScript(input);
    console.log(`Result: ${result}\n-------------------`);
});
