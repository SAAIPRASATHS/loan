/**
 * Seed Demo User for FinBridge AI
 * Income: 35000, EMI: 5000, Loan: 200000, Credit Score: 720
 */
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../.env') });

const User = require('../models/User');

const seedDemo = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        // Check if demo user already exists
        const existing = await User.findOne({ email: 'demo@finbridge.ai' });
        if (existing) {
            console.log('Demo user already exists. Updating...');
            existing.financialProfile = {
                monthlyIncome: 35000,
                employmentStatus: 'employed',
                creditScore: 720,
                existingLoans: 1,
                age: 28
            };
            await existing.save();
            console.log('Demo user updated successfully');
        } else {
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash('demo123', salt);

            await User.create({
                name: 'Demo User',
                email: 'demo@finbridge.ai',
                password: hashedPassword,
                phone: '9876543210',
                languagePreference: 'en',
                financialProfile: {
                    monthlyIncome: 35000,
                    employmentStatus: 'employed',
                    creditScore: 720,
                    existingLoans: 1,
                    age: 28
                }
            });
            console.log('Demo user created successfully');
        }

        console.log('\n--- Demo Login Credentials ---');
        console.log('Email: demo@finbridge.ai');
        console.log('Password: demo123');
        console.log('Income: ₹35,000 | EMI: ₹5,000 | Credit Score: 720');
        console.log('-------------------------------\n');

        await mongoose.disconnect();
        process.exit(0);
    } catch (error) {
        console.error('Seed Error:', error);
        process.exit(1);
    }
};

seedDemo();
