const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

async function createBorrower() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        // Check if borrower already exists
        const existingBorrower = await User.findOne({ email: 'borrower@test.com' });
        if (existingBorrower) {
            console.log('Borrower user already exists');
            console.log('Email:', existingBorrower.email);
            console.log('Role:', existingBorrower.role);
            process.exit(0);
        }

        // Create borrower user
        const borrower = await User.create({
            name: 'Test Borrower',
            email: 'borrower@test.com',
            password: 'password123',
            phone: '9876543210',
            languagePreference: 'en',
            role: 'borrower'
        });

        console.log('Borrower user created successfully!');
        console.log('Email:', borrower.email);
        console.log('Password: password123');
        console.log('Role:', borrower.role);

        process.exit(0);
    } catch (err) {
        console.error('Error creating borrower:', err.message);
        process.exit(1);
    }
}

createBorrower();
