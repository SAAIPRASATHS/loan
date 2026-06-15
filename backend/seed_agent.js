const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

const seedAgent = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        const agentEmail = 'raghav.v2024aids@sece.ac.in';

        // Check if agent already exists
        const existingAgent = await User.findOne({ email: agentEmail });
        if (existingAgent) {
            console.log('Agent already exists. Updating role to agent...');
            existingAgent.role = 'agent';
            await existingAgent.save();
            console.log('Agent updated successfully');
        } else {
            console.log('Creating new agent user...');
            const newAgent = new User({
                name: 'Raghav Admin',
                email: agentEmail,
                password: 'password123',
                phone: '9999999999',
                role: 'agent',
                languagePreference: 'en'
            });
            await newAgent.save();
            console.log('Agent user created successfully with password: password123');
        }

        process.exit(0);
    } catch (error) {
        console.error('Error seeding agent:', error);
        process.exit(1);
    }
};

seedAgent();
