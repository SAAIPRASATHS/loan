const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/database');
const path = require('path');

// Load environment variables
dotenv.config();

// Connect to Database
connectDB();

const app = express();

// Init Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: false }));

// Static folder for uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Define Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/loans', require('./routes/loans'));
app.use('/api/applications', require('./routes/applications'));
app.use('/api/chat', require('./routes/chat'));
app.use('/api/emi', require('./routes/emi'));
app.use('/api/eligibility', require('./routes/eligibility'));
app.use('/api/schemes', require('./routes/schemes'));
app.use('/api/ocr', require('./routes/ocr'));
app.use('/api/fraud-check', require('./routes/fraud'));

// Base route
app.get('/', (req, res) => {
    res.send('FinBridge AI API is running...');
});

// Global error handler
app.use((err, req, res, next) => {
    console.error('Unhandled Error:', err);
    res.status(500).json({ message: 'Internal server error' });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`FinBridge AI Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});
