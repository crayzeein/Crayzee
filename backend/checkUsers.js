const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');

dotenv.config({ path: '.env' });

const checkUsers = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        const count = await User.countDocuments();
        const users = await User.find().limit(5).select('-password');
        console.log(`Total users in DB: ${count}`);
        if (count > 0) {
            console.log('Sample users:', JSON.stringify(users, null, 2));
        }
        process.exit(0);
    } catch (error) {
        console.error('Error checking users:', error);
        if (error.reason) console.error('Connection reason:', error.reason);
        process.exit(1);
    }
};

checkUsers();
