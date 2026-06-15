const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const prisma = require('../prisma/client');
const { protect } = require('../middleware/auth');

// Generate JWT
const generateToken = (id) => {
    if (!process.env.JWT_SECRET) {
        console.error('CRITICAL: JWT_SECRET is not defined in environment variables.');
        throw new Error('Internal Server Error: Missing encryption configuration');
    }
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '30d',
    });
};

// @desc    Register new user
// @route   POST /api/auth/register
// @access  Public
router.post('/register', async (req, res) => {
    try {
        const { name, email, password, phone, languagePreference, role } = req.body;

        const userExists = await prisma.user.findUnique({ where: { email } });

        if (userExists) {
            return res.status(400).json({ message: 'User already exists' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const user = await prisma.user.create({
            data: {
                name,
                email,
                password: hashedPassword,
                phone,
                languagePreference: languagePreference || 'en',
                role: role || 'borrower'
            }
        });

        if (user) {
            res.status(201).json({
                _id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                languagePreference: user.languagePreference,
                token: generateToken(user.id),
            });
        } else {
            res.status(400).json({ message: 'Invalid user data' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await prisma.user.findUnique({ where: { email } });

        if (user && (await bcrypt.compare(password, user.password))) {
            res.json({
                _id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                languagePreference: user.languagePreference,
                token: generateToken(user.id),
            });
        } else {
            res.status(401).json({ message: 'Invalid email or password' });
        }
    } catch (error) {
        console.error('Login Error:', error);
        res.status(500).json({
            message: 'Server Error during login',
            details: error.message,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
});

// @desc    Get user profile
// @route   GET /api/auth/profile
// @access  Private
router.get('/profile', protect, async (req, res) => {
    try {
        const user = await prisma.user.findUnique({ where: { id: req.user.id } });

        if (user) {
            res.json({
                _id: user.id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                role: user.role,
                languagePreference: user.languagePreference,
                financialProfile: {
                    monthlyIncome: user.monthlyIncome,
                    employmentStatus: user.employmentStatus,
                    creditScore: user.creditScore,
                    existingLoans: user.existingLoans,
                    age: user.age
                }
            });
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
router.put('/profile', protect, async (req, res) => {
    try {
        const user = await prisma.user.findUnique({ where: { id: req.user.id } });

        if (user) {
            const updateData = {
                name: req.body.name || user.name,
                email: req.body.email || user.email,
                phone: req.body.phone || user.phone,
                languagePreference: req.body.languagePreference || user.languagePreference,
            };

            if (req.body.financialProfile) {
                if (req.body.financialProfile.monthlyIncome !== undefined) updateData.monthlyIncome = req.body.financialProfile.monthlyIncome;
                if (req.body.financialProfile.employmentStatus !== undefined) updateData.employmentStatus = req.body.financialProfile.employmentStatus;
                if (req.body.financialProfile.creditScore !== undefined) updateData.creditScore = req.body.financialProfile.creditScore;
                if (req.body.financialProfile.existingLoans !== undefined) updateData.existingLoans = req.body.financialProfile.existingLoans;
                if (req.body.financialProfile.age !== undefined) updateData.age = req.body.financialProfile.age;
            }

            if (req.body.password) {
                const salt = await bcrypt.genSalt(10);
                updateData.password = await bcrypt.hash(req.body.password, salt);
            }

            const updatedUser = await prisma.user.update({
                where: { id: user.id },
                data: updateData
            });

            res.json({
                _id: updatedUser.id,
                name: updatedUser.name,
                email: updatedUser.email,
                role: updatedUser.role,
                languagePreference: updatedUser.languagePreference,
                token: generateToken(updatedUser.id),
            });
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
