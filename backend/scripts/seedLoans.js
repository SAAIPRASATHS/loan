const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Loan = require('../models/Loan');

dotenv.config();

const loans = [
    {
        loanType: 'personal',
        name: {
            en: 'Standard Personal Loan',
            hi: 'मानक व्यक्तिगत ऋण',
            ta: 'நிலையான தனிநபர் கடன்'
        },
        description: {
            en: 'Quick personal loan for all your needs with flexible repayment options.',
            hi: 'लचीले पुनर्भुगतान विकल्पों के साथ आपकी सभी जरूरतों के लिए त्वरित व्यक्तिगत ऋण।',
            ta: 'நெகிழ்வான திருப்பிச் செலுத்தும் விருப்பங்களுடன் உங்கள் அனைத்து தேவைகளுக்கும் உடனடி தனிநபர் கடன்.'
        },
        interestRate: { min: 10.5, max: 18.0 },
        loanAmount: { min: 50000, max: 2500000 },
        tenure: { min: 12, max: 60 },
        eligibilityCriteria: {
            minAge: 21,
            maxAge: 60,
            minIncome: 25000,
            minCreditScore: 700,
            employmentRequired: true,
            maxExistingLoans: 2
        },
        requiredDocuments: [
            { en: 'ID Proof (Aadhar/PAN)', hi: 'पहचान प्रमाण (आधार/पैन)', ta: 'அடையாளச் சான்று (ஆதார்/பான்)' },
            { en: 'Income Proof (3 months salary slip)', hi: 'आय प्रमाण (3 महीने की सैलरी स्लिप)', ta: 'வருமானச் சான்று (3 மாத சம்பள சீட்டு)' },
            { en: 'Bank Statement (6 months)', hi: 'बैंक स्टेटमेंट (6 महीने)', ta: 'வங்கி அறிக்கை (6 மாதங்கள்)' }
        ],
        features: [
            { en: 'No collateral required', hi: 'किसी संपार्श्विक की आवश्यकता नहीं', ta: 'பிணை எதுவும் தேவையில்லை' },
            { en: 'Minimal documentation', hi: 'न्यूनतम दस्तावेज़ीकरण', ta: 'குறைந்தபட்ச ஆவணங்கள்' },
            { en: 'Instant approval', hi: 'तुरंत स्वीकृति', ta: 'உடனடி ஒப்புதல்' }
        ],
        processingFee: 1500
    },
    {
        loanType: 'education',
        name: {
            en: 'Empower Student Loan',
            hi: 'सशक्त छात्र ऋण',
            ta: 'அதிகாரமளிக்கும் கல்விக்கடன்'
        },
        description: {
            en: 'Higher studies loan for premium institutes in India and abroad.',
            hi: 'भारत और विदेशों में प्रीमियम संस्थानों के लिए उच्च शिक्षा ऋण।',
            ta: 'இந்தியா மற்றும் வெளிநாடுகளில் உள்ள பிரீமியம் நிறுவனங்களுக்கான உயர்கல்வி கடன்.'
        },
        interestRate: { min: 8.5, max: 12.0 },
        loanAmount: { min: 100000, max: 5000000 },
        tenure: { min: 36, max: 120 },
        eligibilityCriteria: {
            minAge: 18,
            maxAge: 35,
            minIncome: 15000,
            minCreditScore: 650,
            employmentRequired: false,
            maxExistingLoans: 1
        },
        requiredDocuments: [
            { en: 'Admission Letter', hi: 'प्रवेश पत्र', ta: 'சேர்க்கை கடிதம்' },
            { en: 'Mark Sheets (10th, 12th, Graduation)', hi: 'अंक तालिकाएं (10वीं, 12वीं, स्नातक)', ta: 'மதிப்பெண் பட்டியல்கள் (10, 12, பட்டம்)' },
            { en: 'Co-applicant Income Proof', hi: 'सह-आवेदक आय प्रमाण', ta: 'கூட்டு விண்ணப்பதாரர் வருமானச் சான்று' }
        ],
        features: [
            { en: 'Moratorium period available', hi: 'मोराटोरियम अवधि उपलब्ध', ta: 'கடனைத் திருப்பிக் கட்ட அவகாசம் உள்ளது' },
            { en: 'Tax benefits under Sec 80E', hi: 'धारा 80E के तहत कर लाभ', ta: 'பிரிவு 80E-ன் கீழ் வரி சலுகைகள்' }
        ],
        processingFee: 500
    },
    {
        loanType: 'home',
        name: {
            en: 'Dream Home Loan',
            hi: 'सपनों का घर ऋण',
            ta: 'கனவு இல்லக் கடன்'
        },
        description: {
            en: 'Affordable home loans for buying, constructing, or renovating your house.',
            hi: 'अपना घर खरीदने, बनाने या नवीनीकरण करने के लिए किफायती गृह ऋण।',
            ta: 'உங்கள் வீட்டை வாங்க, கட்ட அல்லது புதுப்பிக்க மலிவான வீட்டுக் கடன்கள்.'
        },
        interestRate: { min: 8.35, max: 9.5 },
        loanAmount: { min: 500000, max: 10000000 },
        tenure: { min: 60, max: 360 },
        eligibilityCriteria: {
            minAge: 21,
            maxAge: 65,
            minIncome: 30000,
            minCreditScore: 750,
            employmentRequired: true,
            maxExistingLoans: 2
        },
        requiredDocuments: [
            { en: 'Property Documents', hi: 'संपत्ति के दस्तावेज', ta: 'சொத்து ஆவணங்கள்' },
            { en: 'Income Proof (ITR/Salary Slips)', hi: 'आय प्रमाण (आईटीआर/सैलरी स्लिप)', ta: 'வருமானச் சான்று (ITR/சம்பள சீட்டுகள்)' },
            { en: 'ID & Address Proof', hi: 'पहचान और पता प्रमाण', ta: 'அடையாளம் மற்றும் முகவரி சான்று' }
        ],
        features: [
            { en: 'Longer repayment tenure', hi: 'लंबी पुनर्भुगतान अवधि', ta: 'நீண்ட திருப்பிச் செலுத்தும் காலம்' },
            { en: 'PMAY subsidy applicable', hi: 'पीएमएवाई सब्सिडी लागू', ta: 'PMAY மானியம் பொருந்தும்' },
            { en: 'Balance transfer facility', hi: 'बैलेंस ट्रांसफर की सुविधा', ta: 'கடன் மாற்ற வசதி' }
        ],
        processingFee: 5000
    },
    {
        loanType: 'car',
        name: {
            en: 'Auto Drive Loan',
            hi: 'वाहन ऋण',
            ta: 'வாகன கடன்'
        },
        description: {
            en: 'Finance up to 90% of your new car\'s on-road price.',
            hi: 'अपनी नई कार की ऑन-रोड कीमत का 90% तक वित्तपोषित करें।',
            ta: 'உங்கள் புதிய காரின் ஆன்-ரோடு விலையில் 90% வரை கடன் பெறுங்கள்.'
        },
        interestRate: { min: 8.7, max: 11.0 },
        loanAmount: { min: 100000, max: 5000000 },
        tenure: { min: 12, max: 84 },
        eligibilityCriteria: {
            minAge: 21,
            maxAge: 60,
            minIncome: 20000,
            minCreditScore: 700,
            employmentRequired: true,
            maxExistingLoans: 2
        },
        requiredDocuments: [
            { en: 'Vehicle Quotation', hi: 'वाहन कोटेशन', ta: 'வாகன விலைப்பட்டியல்' },
            { en: 'Income Proof', hi: 'आय प्रमाण', ta: 'வருமானச் சான்று' },
            { en: 'KYC Documents', hi: 'केवाईसी दस्तावेज', ta: 'KYC ஆவணங்கள்' }
        ],
        features: [
            { en: 'Up to 90% funding', hi: '90% तक फंडिंग', ta: '90% வரை நிதி' },
            { en: 'Quick disbursement', hi: 'त्वरित संवितरण', ta: 'விரைவான பட்டுவாடா' },
            { en: 'Minimal paperwork', hi: 'न्यूनतम कागजी कार्रवाई', ta: 'குறைந்தபட்ச காகிதப்பணி' }
        ],
        processingFee: 2000
    },
    {
        loanType: 'gold',
        name: {
            en: 'Instant Gold Loan',
            hi: 'तत्काल स्वर्ण ऋण',
            ta: 'உடனடி தங்கக் கடன்'
        },
        description: {
            en: 'Get instant cash against your gold ornaments with minimal documentation.',
            hi: 'न्यूनतम दस्तावेजों के साथ अपने सोने के गहनों पर तत्काल नकद प्राप्त करें।',
            ta: 'குறைந்தபட்ச ஆவணங்களுடன் உங்கள் தங்க நகைகளுக்கு உடனடி பணம் பெறுங்கள்.'
        },
        interestRate: { min: 9.0, max: 24.0 },
        loanAmount: { min: 10000, max: 5000000 },
        tenure: { min: 6, max: 36 },
        eligibilityCriteria: {
            minAge: 18,
            maxAge: 70,
            minIncome: 0,
            minCreditScore: 0,
            employmentRequired: false,
            maxExistingLoans: 5
        },
        requiredDocuments: [
            { en: 'Start Identity Proof', hi: 'पहचान प्रमाण', ta: 'அடையாளச் சான்று' },
            { en: 'Address Proof', hi: 'पता प्रमाण', ta: 'முகவரி சான்று' }
        ],
        features: [
            { en: 'No income proof required', hi: 'आय प्रमाण की आवश्यकता नहीं', ta: 'வருமானச் சான்று தேவையில்லை' },
            { en: 'Safety of your ornaments', hi: 'आपके गहनों की सुरक्षा', ta: 'உங்கள் நகைகளின் பாதுகாப்பு' },
            { en: 'Pay interest only option', hi: 'केवल ब्याज भुगतान विकल्प', ta: 'வட்டி மட்டும் செலுத்தும் வசதி' }
        ],
        processingFee: 500
    },
    {
        loanType: 'agriculture',
        name: {
            en: 'Kisan Samriddhi Loan',
            hi: 'किसान समृद्धि ऋण',
            ta: 'விவசாய சம்ரித்தி கடன்'
        },
        description: {
            en: 'Support for farming, equipment purchase, and agricultural needs.',
            hi: 'खेती, उपकरण खरीद और कृषि आवश्यकताओं के लिए सहायता।',
            ta: 'விவசாயம், உபகரணங்கள் வாங்குதல் மற்றும் விவசாயத் தேவைகளுக்கான ஆதரவு.'
        },
        interestRate: { min: 7.0, max: 9.0 },
        loanAmount: { min: 50000, max: 300000 },
        tenure: { min: 12, max: 60 },
        eligibilityCriteria: {
            minAge: 18,
            maxAge: 70,
            minIncome: 0,
            minCreditScore: 600,
            employmentRequired: false,
            maxExistingLoans: 2
        },
        requiredDocuments: [
            { en: 'Land Ownership Proof', hi: 'भूमि स्वामित्व प्रमाण', ta: 'நில உரிமைச் சான்று' },
            { en: 'Kisan Credit Card', hi: 'किसान क्रेडिट कार्ड', ta: 'கிசான் கிரெடிட் கார்டு' },
            { en: 'ID Proof', hi: 'पहचान प्रमाण', ta: 'அடையாளச் சான்று' }
        ],
        features: [
            { en: 'Low interest rate', hi: 'कम ब्याज दर', ta: 'குறைந்த வட்டி விகிதம்' },
            { en: 'Flexible repayment linked to harvest', hi: 'फसल से जुड़ा लचीला पुनर्भुगतान', ta: 'அறுவடைக்கு ஏற்ற நெகிழ்வான திருப்பிச் செலுத்துதல்' },
            { en: 'Insurance coverage', hi: 'बीमा कवरेज', ta: 'காப்பீடு கவரேஜ்' }
        ],
        processingFee: 0
    },
    {
        loanType: 'business',
        name: {
            en: 'Growth Business Loan',
            hi: 'व्यापार वृद्धि ऋण',
            ta: 'வணிக வளர்ச்சி கடன்'
        },
        description: {
            en: 'Capital for business expansion, working capital, or new equipment.',
            hi: 'व्यापार विस्तार, कार्यशील पूंजी, या नए उपकरणों के लिए पूंजी।',
            ta: 'வணிக விரிவாக்கம், நடைமுறை மூலதனம் அல்லது புதிய உபகரணங்களுக்கான மூலதனம்.'
        },
        interestRate: { min: 11.0, max: 16.0 },
        loanAmount: { min: 200000, max: 10000000 },
        tenure: { min: 12, max: 60 },
        eligibilityCriteria: {
            minAge: 24,
            maxAge: 65,
            minIncome: 500000, // Annual turnover roughly
            minCreditScore: 700,
            employmentRequired: true,
            maxExistingLoans: 3
        },
        requiredDocuments: [
            { en: 'Business Registration', hi: 'व्यापार पंजीकरण', ta: 'வணிகப் பதிவு' },
            { en: 'GST Returns (1 year)', hi: 'जीएसटी रिटर्न (1 वर्ष)', ta: 'GST கணக்குகள் (1 ஆண்டு)' },
            { en: 'Bank Statements (6 months)', hi: 'बैंक स्टेटमेंट (6 महीने)', ta: 'வங்கி அறிக்கைகள் (6 மாதங்கள்)' }
        ],
        features: [
            { en: 'Collateral-free options', hi: 'गारंटी-मुक्त विकल्प', ta: 'பிணையற்ற விருப்பங்கள்' },
            { en: 'Overdraft facility', hi: 'ओवरड्राफ्ट सुविधा', ta: 'ஓவர் டிராஃப்ட் வசதி' },
            { en: 'Fast processing', hi: 'तेजी से प्रसंस्करण', ta: 'விரைவான செயல்முறை' }
        ],
        processingFee: 2500
    }
];

const seedLoans = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB for seeding');

        await Loan.deleteMany({});
        console.log('Cleared existing loans');

        await Loan.insertMany(loans);
        console.log('Loans seeded successfully');

        process.exit();
    } catch (error) {
        console.error(`Error: ${error.message}`);
        process.exit(1);
    }
};

seedLoans();
