const mongoose = require('mongoose');

const LOCAL_URI = 'mongodb://localhost:27017/loan-advisor';

console.log('Testing local connection to:', LOCAL_URI);

mongoose.connect(LOCAL_URI, {
    serverSelectionTimeoutMS: 2000
})
    .then(() => {
        console.log('SUCCESS: Connected to local MongoDB');
        process.exit(0);
    })
    .catch(err => {
        console.error('FAILURE: Could not connect to local MongoDB');
        console.error('Error:', err.message);
        process.exit(1);
    });
