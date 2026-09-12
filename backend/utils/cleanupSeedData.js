const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const mongoose = require('mongoose');
const Product = require('../models/Product');
const Category = require('../models/Category');

// One-time purge of seeded demo products and every non-clothing category
const cleanup = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB connected for cleanup...');

    const seeded = await Product.deleteMany({ 'images.public_id': /^seed_/ });
    console.log(`Removed ${seeded.deletedCount} seeded products`);

    const unsplash = await Product.deleteMany({ 'images.url': /images\.unsplash\.com/ });
    console.log(`Removed ${unsplash.deletedCount} products still using stock photos`);

    const nonClothing = await Product.deleteMany({ category: { $nin: ['clothing', 'Clothing'] } });
    console.log(`Removed ${nonClothing.deletedCount} non-clothing products`);

    const cats = await Category.deleteMany({ slug: { $ne: 'clothing' } });
    console.log(`Removed ${cats.deletedCount} non-clothing categories`);

    const left = await Product.countDocuments();
    console.log(`Done. ${left} products remain.`);
    process.exit();
  } catch (error) {
    console.error('Cleanup error:', error);
    process.exit(1);
  }
};

cleanup();
