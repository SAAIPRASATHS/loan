const mongoose = require('mongoose');
require('dotenv').config();
const LoanApplication = require('./models/LoanApplication');

async function inspectLead(id) {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        const lead = await LoanApplication.findById(id);
        console.log(JSON.stringify(lead, null, 2));
        await mongoose.disconnect();
    } catch (err) {
        console.error(err);
    }
}

inspectLead('69943726f55d2263bd9c4a1b');
