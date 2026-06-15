require('dotenv').config({ path: './backend/.env' });
const mongoose = require('mongoose');
const Scheme = require('./models/Scheme');

const schemes = [
    {
        name: {
            en: "Pradhan Mantri Mudra Yojana (PMMY)",
            hi: "प्रधानमंत्री मुद्रा योजना (PMMY)",
            ta: "பிரadhan மந்திரி முத்ரா யோஜனா (PMMY)"
        },
        description: {
            en: "Provides loans up to 10 lakh to non-corporate, non-farm small/micro enterprises.",
            hi: "गैर-कॉर्पोरेट, गैर-कृषि लघु/सूक्ष्म उद्यमों को 10 लाख तक का ऋण प्रदान करता है।",
            ta: "கார்ப்பரேட் அல்லாத, பண்ணை அல்லாத சிறு/குறு நிறுவனங்களுக்கு 10 லட்சம் வரை கடன் வழங்குகிறது."
        },
        benefit: {
            en: "Collateral-free loans for start-ups and business expansion.",
            hi: "स्टार्ट-अप और व्यवसाय विस्तार के लिए संपार्श्विक-मुक्त ऋण।",
            ta: "தொடக்க நிறுவனங்கள் மற்றும் வணிக விரிவாக்கத்திற்கு பிணையில்லா கடன்கள்."
        },
        eligibilityCriteria: {
            minAge: 18,
            maxAge: 65,
            targetAudience: {
                en: "Small business owners and micro-entrepreneurs",
                hi: "छोटे व्यवसाय के मालिक और सूक्ष्म उद्यमी",
                ta: "சிறு வணிக உரிமையாளர்கள் மற்றும் குறுமுனைவோர்கள்"
            }
        },
        portalUrl: "https://www.mudra.org.in/",
        category: "msme"
    },
    {
        name: {
            en: "PM SVANidhi",
            hi: "पीएम स्वनिधि",
            ta: "பிரதமர் ஸ்வாநிதி"
        },
        description: {
            en: "A special micro-credit facility for street vendors to resume their livelihood.",
            hi: "रेहड़ी-पटरी वालों के लिए अपनी आजीविका फिर से शुरू करने के लिए एक विशेष सूक्ष्म-ऋण सुविधा।",
            ta: "தெருவோர வியாபாரிகள் தங்கள் வாழ்வாதாரத்தை மீண்டும் தொடங்குவதற்கான சிறப்பு நுண்கடன் வசதி."
        },
        benefit: {
            en: "Working capital loan up to ₹10,000, with interest subsidy on regular repayment.",
            hi: "₹10,000 तक का कार्यशील पूंजी ऋण, नियमित पुनर्भुगतान पर ब्याज सब्सिडी के साथ।",
            ta: "₹10,000 வரை பணி மூலதனக் கடன், வழக்கமான திருப்பிச் செலுத்தினால் வட்டி மானியத்துடன்."
        },
        eligibilityCriteria: {
            minAge: 18,
            targetAudience: {
                en: "Street vendors and hawkers",
                hi: "रेहड़ी-पटरी वाले और फेरीवाले",
                ta: "தெருவோர வியாபாரிகள் மற்றும் விற்பனை செய்பவர்கள்"
            }
        },
        portalUrl: "https://pmsvanidhi.mohua.gov.in/",
        category: "street_vendor"
    },
    {
        name: {
            en: "PMEGP (Prime Minister's Employment Generation Programme)",
            hi: "PMEGP (प्रधानमंत्री रोजगार सृजन कार्यक्रम)",
            ta: "PMEGP (பிரதம மந்திரி வேலைவாய்ப்பு உருவாக்கும் திட்டம்)"
        },
        description: {
            en: "Credit-linked subsidy scheme for setting up new micro-enterprises.",
            hi: "नए सूक्ष्म उद्यम स्थापित करने के लिए क्रेडिट-लिंक्ड सब्सिडी योजना।",
            ta: "புதிய குறு நிறுவனங்களை அமைப்பதற்கான கடன் சார்ந்த மானியத் திட்டம்."
        },
        benefit: {
            en: "Subsidy ranging from 15% to 35% on project cost.",
            hi: "परियोजना लागत पर 15% से 35% तक की सब्सिडी।",
            ta: "திட்டச் செலவில் 15% முதல் 35% வரை மானியம்."
        },
        eligibilityCriteria: {
            minAge: 18,
            targetAudience: {
                en: "Unemployed youth and traditional artisans",
                hi: "बेरोजगार युवा और पारंपरिक कारीगर",
                ta: "வேலையில்லாத இளைஞர்கள் மற்றும் பாரம்பரிய கலைஞர்கள்"
            }
        },
        portalUrl: "https://www.kviconline.gov.in/pmegp/",
        category: "business"
    },
    {
        name: {
            en: "Stand-Up India",
            hi: "स्टैंड-अप इंडिया",
            ta: "ஸ்டாண்ட்-அப் இந்தியா"
        },
        description: {
            en: "Facilitates bank loans between 10 lakh and 1 crore to SC/ST and women borrowers.",
            hi: "SC/ST और महिला उधारकर्ताओं को 10 लाख से 1 करोड़ के बीच बैंक ऋण की सुविधा प्रदान करता है।",
            ta: "ஆதிதிராவிடர்/பழங்குடியினர் மற்றும் பெண் கடன் வாங்குபவர்களுக்கு 10 லட்சம் முதல் 1 கோடி வரை வங்கி கடன்களை வழங்குகிறது."
        },
        benefit: {
            en: "Supports entrepreneurship among women and marginalized communities.",
            hi: "महिलाओं और हाशिए के समुदायों के बीच उद्यमिता का समर्थन करता है।",
            ta: "பெண்கள் மற்றும் விளிம்புநிலை சமூகத்தினரிடையே தொழில்முனைவை ஆதரிக்கிறது."
        },
        eligibilityCriteria: {
            minAge: 18,
            targetAudience: {
                en: "SC/ST and Women entrepreneurs",
                hi: "SC/ST और महिला उद्यमी",
                ta: "ஆதிதிராவிடர்/பழங்குடியினர் மற்றும் பெண் தொழில்முனைவோர்"
            }
        },
        portalUrl: "https://www.standupmitra.in/",
        category: "msme"
    }
];

const seedDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB for seeding schemes...');

        await Scheme.deleteMany({});
        console.log('Cleared existing schemes.');

        await Scheme.insertMany(schemes);
        console.log(`Successfully seeded ${schemes.length} schemes.`);

        mongoose.connection.close();
    } catch (error) {
        console.error('Error seeding schemes:', error);
        process.exit(1);
    }
};

seedDB();
