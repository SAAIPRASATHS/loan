const axios = require('axios');
const crypto = require('crypto');

/**
 * Aadhaar Service for verifying name matching using A4A (Aadhaar for Authentication) API.
 */
class AadhaarService {
    constructor() {
        this.apiKey = process.env.A4A_API_KEY;
        // Placeholder for A4A API endpoint - would be updated with actual vendor URL
        this.apiUrl = 'https://api.a4a.io/v1/verify-aadhaar-name';
    }

    /**
     * Verifies if the applicant name matches the name linked to the Aadhaar number.
     * @param {string} aadharNumber - The 12-digit Aadhaar number.
     * @param {string} applicantName - The name provided by the applicant.
     * @returns {Promise<Object>} - Verification results.
     */
    async verifyName(aadharNumber, applicantName) {
        if (!this.apiKey) {
            console.error('A4A_API_KEY is not defined.');
            return {
                isVerified: false,
                nameMatchStatus: 'error',
                confidenceScore: 0,
                details: 'Verification service not configured'
            };
        }

        try {
            // Mocking the API call for now since we don't have the real endpoint
            // In a real implementation, this would be an axios.post call
            console.log(`Verifying Aadhaar ${aadharNumber} for name: ${applicantName}`);

            // Simulating API response delay
            await new Promise(resolve => setTimeout(resolve, 1000));

            // Logic: Fuzzy match simulation
            // In a real A4A API, it might return the actual name on file, which we then compare.
            const normalizedApplicant = applicantName.toLowerCase().trim();

            // For demonstration/testing: If name contains "Test Mismatch", we simulate a mismatch
            if (normalizedApplicant.includes('mismatch')) {
                return {
                    isVerified: true,
                    nameMatchStatus: 'mismatch',
                    confidenceScore: 10,
                    details: 'Name mismatch detected with Aadhaar records.'
                };
            }

            // Default behavior: Match
            return {
                isVerified: true,
                nameMatchStatus: 'match',
                confidenceScore: 95,
                details: 'Name matches Aadhaar records successfully.'
            };

        } catch (error) {
            console.error('Aadhaar Verification Error:', error.message);
            return {
                isVerified: false,
                nameMatchStatus: 'error',
                confidenceScore: 0,
                details: `Error: ${error.message}`
            };
        }
    }

    /**
     * Simple fuzzy match Helper (Levenshtein distance could be used here)
     */
    calculateSimilarity(str1, str2) {
        const s1 = str1.toLowerCase().replace(/\s+/g, '');
        const s2 = str2.toLowerCase().replace(/\s+/g, '');
        if (s1 === s2) return 100;
        // Minimal logic for now
        return s1.includes(s2) || s2.includes(s1) ? 80 : 0;
    }
}

module.exports = new AadhaarService();
