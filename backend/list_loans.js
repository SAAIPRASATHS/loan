const mongoose = require('mongoose');
const Loan = require('./models/Loan');
require('dotenv').config();

async function listLoans() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        const loans = await Loan.find({ isActive: true });
        console.log('LOANS_LIST_START');
        loans.forEach(l => {
            console.log(`ID: ${l._id} | Type: ${l.loanType} | Name: ${l.name.en}`);
        });
        console.log('LOANS_LIST_END');
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

listLoans();
