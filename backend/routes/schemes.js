const express = require('express');
const router = express.Router();

const SCHEMES = [
    // --- Business & Entrepreneurship ---
    {
        id: 'mudra',
        name: 'PM Mudra Yojana (PMMY)',
        description: 'Micro Units Development & Refinance Agency scheme for small business loans up to ₹10 lakh.',
        categories: ['Shishu (up to ₹50,000)', 'Kishore (₹50,001 - ₹5,00,000)', 'Tarun (₹5,00,001 - ₹10,00,000)'],
        eligibility: {
            maxIncome: 1000000,
            employmentTypes: ['self-employed', 'business', 'startup'],
            purposes: ['business', 'startup', 'working-capital', 'machinery']
        },
        benefits: ['No collateral required', 'Low interest rates (8-12%)', 'Available at all banks', 'Quick processing'],
        link: 'https://www.mudra.org.in'
    },
    {
        id: 'standup',
        name: 'Stand-Up India Scheme',
        description: 'Loans between ₹10 lakh and ₹1 crore for SC/ST and women entrepreneurs to set up greenfield enterprises.',
        categories: ['Manufacturing', 'Services', 'Trading'],
        eligibility: {
            maxIncome: null,
            employmentTypes: ['self-employed', 'business', 'startup'],
            purposes: ['business', 'startup', 'manufacturing']
        },
        benefits: ['Loans from ₹10L to ₹1Cr', 'Repayment up to 7 years', 'Moratorium up to 18 months', 'Support for women/SC/ST'],
        link: 'https://www.standupmitra.in'
    },
    {
        id: 'pmegp',
        name: 'PMEGP (Prime Minister Employment Generation Programme)',
        description: 'Credit-linked subsidy scheme for setting up new micro-enterprises in non-farm sector.',
        categories: ['Manufacturing (up to ₹50L)', 'Services (up to ₹20L)'],
        eligibility: {
            maxIncome: null,
            employmentTypes: ['unemployed', 'self-employed', 'student', 'business'],
            purposes: ['business', 'startup']
        },
        benefits: ['Subsidy up to 35% (rural) / 25% (urban)', 'Own contribution only 5-10%', 'EDP training provided'],
        link: 'https://www.kviconline.gov.in/pmegp'
    },
    {
        id: 'pm_svanidhi',
        name: 'PM SVANidhi',
        description: 'Special Micro-Credit Facility for Street Vendors to restart their businesses.',
        categories: ['Street Vendors', 'Hawkers'],
        eligibility: {
            maxIncome: 300000,
            employmentTypes: ['self-employed', 'unemployed', 'business'],
            purposes: ['business', 'working-capital']
        },
        benefits: ['Collateral-free working capital loan up to ₹10,000', 'Interest subsidy @ 7%', 'Cashback incentives'],
        link: 'https://pmsvanidhi.mohua.gov.in'
    },
    {
        id: 'startup_india',
        name: 'Startup India Seed Fund Scheme',
        description: 'Financial assistance to startups for proof of concept, prototype development, product trials, and market entry.',
        categories: ['Seed Fund', 'Incubator'],
        eligibility: {
            maxIncome: null,
            employmentTypes: ['business', 'startup', 'self-employed'],
            purposes: ['startup', 'business', 'innovation']
        },
        benefits: ['Grants up to ₹20 Lakhs', 'Debt/Convertible debentures up to ₹50 Lakhs', 'Mentorship support'],
        link: 'https://seedfund.startupindia.gov.in'
    },

    // --- Housing & Infrastructure ---
    {
        id: 'pmay_urban',
        name: 'Pradhan Mantri Awas Yojana (Urban)',
        description: 'Interest subsidy on home loans for EWS, LIG, and MIG categories to ensure Housing for All.',
        categories: ['EWS', 'LIG', 'MIG-I', 'MIG-II'],
        eligibility: {
            maxIncome: 1800000,
            employmentTypes: ['employed', 'self-employed', 'business'],
            purposes: ['home', 'housing', 'construction', 'personal']
        },
        benefits: ['Interest subsidy up to 6.5%', 'Benefit up to ₹2.67 Lakhs', 'preference for women ownership'],
        link: 'https://pmaymis.gov.in'
    },

    // --- Education ---
    {
        id: 'vidya_lakshmi',
        name: 'Vidya Lakshmi Education Loan',
        description: 'Comprehensive education loan portal for students seeking loans for higher education in India and abroad.',
        categories: ['Domestic', 'International', 'Technical'],
        eligibility: {
            maxIncome: null,
            employmentTypes: ['student', 'unemployed'],
            purposes: ['education', 'study', 'course', 'personal']
        },
        benefits: ['Single window mechanism', 'Common application form', 'Track application status', 'Links to National Scholarship Portal'],
        link: 'https://www.vidyalakshmi.co.in'
    },
    {
        id: 'csis',
        name: 'Central Sector Interest Subsidy (CSIS)',
        description: 'Interest subsidy on education loans for technical/professional courses for EWS students.',
        categories: ['EWS', 'Technical Education'],
        eligibility: {
            maxIncome: 450000,
            employmentTypes: ['student', 'unemployed'],
            purposes: ['education', 'study']
        },
        benefits: ['Full interest subsidy during moratorium', 'No collateral request', 'Income limit ₹4.5L p.a.'],
        link: 'https://www.education.gov.in'
    },

    // --- Agriculture ---
    {
        id: 'kcc',
        name: 'Kisan Credit Card (KCC)',
        description: 'Adequate and timely credit support to farmers for their cultivation and other needs.',
        categories: ['Agriculture', 'Fisheries', 'Animal Husbandry'],
        eligibility: {
            maxIncome: null,
            employmentTypes: ['self-employed', 'agriculture', 'business'],
            purposes: ['agriculture', 'farming', 'working-capital']
        },
        benefits: ['Credit for cultivation expenses', 'Interest subvention available', 'Flexible repayment', 'ATM formatted debit card'],
        link: 'https://pmkisan.gov.in'
    },
    {
        id: 'acabc',
        name: 'Agri-Clinics & Agri-Business Centres',
        description: 'Supplementing efforts of public extension by providing extension and other services to farmers.',
        categories: ['Agriculture', 'Business'],
        eligibility: {
            maxIncome: null,
            employmentTypes: ['student', 'agriculture', 'self-employed'],
            purposes: ['agriculture', 'startup', 'business']
        },
        benefits: ['Subsidy on bank loan', '36% composite subsidy (44% for SC/ST/Women)', 'Training support'],
        link: 'https://www.agriclinics.net'
    },

    // --- Women Empowerment ---
    {
        id: 'mahila_samridhi',
        name: 'Mahila Samridhi Yojana',
        description: 'Micro-finance scheme for women entrepreneurs to create confidence and self-reliance.',
        categories: ['Women', 'Microfinance'],
        eligibility: {
            maxIncome: 300000,
            employmentTypes: ['self-employed', 'business', 'unemployed', 'women'],
            purposes: ['business', 'startup', 'personal']
        },
        benefits: ['Loans up to ₹1,40,000', 'Rebate in interest', 'Empowerment of backward classes'],
        link: 'https://nsfdc.nic.in'
    },

    // --- Social Security & General ---
    {
        id: 'sukanya_samriddhi',
        name: 'Sukanya Samriddhi Yojana',
        description: 'Small savings scheme for the girl child to secure her future (education/marriage).',
        categories: ['Girl Child', 'Savings'],
        eligibility: {
            maxIncome: null,
            employmentTypes: ['employed', 'self-employed', 'business', 'unemployed'],
            purposes: ['personal', 'family', 'savings']
        },
        benefits: ['High interest rate (approx 8%)', 'Tax benefits under 80C', 'Maturity at 21 years'],
        link: 'https://www.nsiindia.gov.in'
    },
    {
        id: 'atal_pension',
        name: 'Atal Pension Yojana',
        description: 'Pension scheme for citizens of India, focused on the unorganized sector workers.',
        categories: ['Pension', 'Social Security'],
        eligibility: {
            maxIncome: null,
            employmentTypes: ['employed', 'self-employed', 'business', 'unemployed'],
            purposes: ['personal', 'retirement']
        },
        benefits: ['Guaranteed pension of ₹1000-₹5000', 'Government co-contribution', 'Tax benefits'],
        link: 'https://www.npscra.nsdl.co.in'
    },

    // --- Generic Bank Loans (For "All types" coverage) ---
    {
        id: 'personal_loan',
        name: 'Standard Personal Loan',
        description: 'Unsecured loan for personal needs like medical emergency, travel, or debt consolidation.',
        categories: ['Unsecured', 'Personal'],
        eligibility: {
            maxIncome: null,
            employmentTypes: ['employed', 'self-employed'],
            purposes: ['personal', 'travel', 'medical', 'wedding']
        },
        benefits: ['No collateral', 'Quick disbursal', 'Flexible tenure (1-5 years)', 'Minimal documentation'],
        link: 'https://www.rbi.org.in'
    },
    {
        id: 'car_loan',
        name: 'Vehicle / Car Loan',
        description: 'Secured loan for purchasing new or used cars.',
        categories: ['Auto', 'Secured'],
        eligibility: {
            maxIncome: null,
            employmentTypes: ['employed', 'self-employed', 'business'],
            purposes: ['personal', 'vehicle', 'car']
        },
        benefits: ['Up to 90% on-road funding', 'Attractive interest rates', 'Tenure up to 7 years'],
        link: '#'
    },
    {
        id: 'gold_loan',
        name: 'Gold Loan',
        description: 'Secure loan against gold ornaments/coins for immediate cash needs.',
        categories: ['Secured', 'Emergency'],
        eligibility: {
            maxIncome: null,
            employmentTypes: ['employed', 'self-employed', 'business', 'unemployed', 'homemaker'],
            purposes: ['personal', 'business', 'emergency']
        },
        benefits: ['Instant disbursal', 'Lower interest rate than personal loan', 'Pay interest only option'],
        link: '#'
    }
];

// @desc    Get recommended government schemes
// @route   POST /api/schemes
// @access  Public
router.post('/', (req, res) => {
    try {
        const { income, employment, purpose } = req.body;

        const annualIncome = income ? parseFloat(income) * 12 : 0;
        const empType = (employment || '').toLowerCase();
        const loanPurpose = (purpose || '').toLowerCase();

        const recommendations = SCHEMES.filter(scheme => {
            const { eligibility } = scheme;

            // Check income ceiling
            if (eligibility.maxIncome && annualIncome > eligibility.maxIncome) {
                return false;
            }

            // Check employment type match
            const empMatch = eligibility.employmentTypes.includes(empType);

            // Check purpose match
            const purposeMatch = eligibility.purposes.some(p =>
                loanPurpose.includes(p) || p.includes(loanPurpose)
            );

            return empMatch || purposeMatch;
        }).map(scheme => {
            // Generate why user qualifies
            const reasons = [];
            const { eligibility } = scheme;

            if (eligibility.maxIncome && annualIncome <= eligibility.maxIncome) {
                reasons.push(`Your annual income (₹${annualIncome.toLocaleString('en-IN')}) is within the eligibility limit`);
            }
            if (eligibility.employmentTypes.includes(empType)) {
                reasons.push(`Your employment type (${empType}) qualifies for this scheme`);
            }
            if (eligibility.purposes.some(p => loanPurpose.includes(p))) {
                reasons.push(`Your loan purpose (${loanPurpose}) matches this scheme's focus`);
            }

            return {
                id: scheme.id,
                name: scheme.name,
                description: scheme.description,
                categories: scheme.categories,
                benefits: scheme.benefits,
                link: scheme.link,
                whyQualifies: reasons,
                matchScore: reasons.length
            };
        }).sort((a, b) => b.matchScore - a.matchScore);

        res.json({
            totalSchemes: recommendations.length,
            recommendations,
            userProfile: {
                monthlyIncome: income,
                annualIncome,
                employment: empType,
                purpose: loanPurpose
            }
        });
    } catch (error) {
        console.error('Scheme Recommendation Error:', error);
        res.status(500).json({ message: 'Failed to fetch scheme recommendations' });
    }
});

// @desc    Get all available schemes
// @route   GET /api/schemes
// @access  Public
router.get('/', (req, res) => {
    res.json(SCHEMES.map(s => ({
        id: s.id,
        name: s.name,
        description: s.description,
        categories: s.categories,
        benefits: s.benefits,
        link: s.link
    })));
});

module.exports = router;
