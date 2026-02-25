const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');

dotenv.config();

const createAdmin = async () => {
    console.log('Starting createAdmin script...');
    try {
        if (!process.env.MONGODB_URI) {
            throw new Error('MONGODB_URI is not defined in environment');
        }
        console.log('Connecting to:', process.env.MONGODB_URI.split('@')[1] || 'URL hidden');

        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB successfully');

        const adminData = {
            name: "Crayzee Admin",
            email: "crayzee.in@gmail.com",
            password: "crayzeeAH",
            role: "admin"
        };

        console.log('Searching for existing user with email:', adminData.email);
        const existingUser = await User.findOne({ email: adminData.email });
        if (existingUser) {
            console.log('Admin user already exists. Updating details...');
            existingUser.name = adminData.name;
            existingUser.password = adminData.password;
            existingUser.role = adminData.role;
            await existingUser.save();
            console.log('Admin user updated successfully');
        } else {
            console.log('Creating new admin user...');
            const admin = new User(adminData);
            await admin.save();
            console.log('Admin user created successfully');
        }

        process.exit(0);
    } catch (error) {
        console.error('FATAL ERROR in createAdmin:');
        console.error(error);
        process.exit(1);
    }
};

createAdmin();
