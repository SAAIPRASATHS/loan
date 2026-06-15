const mongoose = require('mongoose');
require('dotenv').config();
const User = require('./models/User');
const LoanApplication = require('./models/LoanApplication');

async function findLeads() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        const leads = await LoanApplication.find().limit(5).populate('user', 'name');
        console.log('Found leads:', leads.length);
        leads.forEach(l => {
            console.log(`LEAD_ID: ${l._id} NAME: ${l.user?.name}`);
        });

        // Removed detailed log

        await mongoose.disconnect();
    } catch (err) {
        console.error(err);
    }
}

findLeads();
