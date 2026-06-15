const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

async function seedUser() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        const email = 'saaiprasath2005@gmail.com';

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            console.log('User already exists');
            process.exit(0);
        }

        const user = await User.create({
            name: 'Saai Prasath',
            email: email,
            password: 'password123',
            phone: '1234567890',
            role: 'borrower',
            languagePreference: 'en'
        });

        console.log('User seeded successfully:', user.email);
        process.exit(0);
    } catch (err) {
        console.error('Error seeding user:', err.message);
        process.exit(1);
    }
}

seedUser();
