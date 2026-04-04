require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

mongoose.connect(process.env.MONGODB_URI)
  .then(async () => {
    console.log('MongoDB connected for migration');
    const result = await User.updateMany(
      { isVerified: { $ne: true } }, 
      { $set: { isVerified: true } }
    );
    console.log(`Successfully bypassed verification for ${result.modifiedCount} old users!`);
    process.exit(0);
  })
  .catch(err => {
    console.error('Migration error:', err);
    process.exit(1);
  });
