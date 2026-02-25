const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/User');

dotenv.config({ path: '.env' });

const createAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB connected for admin creation');
    
    // Check if admin already exists
    const adminExists = await User.findOne({ email: 'crayzee.in@gmail.com' });
    if (adminExists) {
      console.log('Admin user already exists. Updating role...');
      adminExists.role = 'admin';
      adminExists.password = 'crayzeeAH'; // This will be re-hashed by the pre-save hook
      await adminExists.save();
      console.log('Admin user updated successfully');
    } else {
      await User.create({
        name: 'Crayzee Admin',
        email: 'crayzee.in@gmail.com',
        password: 'crayzeeAH',
        role: 'admin'
      });
      console.log('Admin user created successfully');
    }
    
    process.exit();
  } catch (error) {
    console.error('Error creating admin user:', error);
    process.exit(1);
  }
};

createAdmin();
