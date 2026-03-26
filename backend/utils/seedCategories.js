const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const mongoose = require('mongoose');
const Category = require('../models/Category');

const categories = [
  {
    name: 'Clothing',
    slug: 'clothing',
    items: [
      { label: 'Men', href: '/browse?category=clothing&gender=men' },
      { label: 'Women', href: '/browse?category=clothing&gender=women' }
    ]
  },
  {
    name: 'Mobile Accessories',
    slug: 'mobile-accessories',
    items: [
      { label: 'All', href: '/browse?category=mobile-accessories' }
    ]
  },
  {
    name: 'Gifts',
    slug: 'gifts',
    items: [
      { label: 'All', href: '/browse?category=gifts' }
    ]
  },
  {
    name: 'Footwear',
    slug: 'footwear',
    items: [
      { label: 'All', href: '/browse?category=footwear' }
    ]
  }
];

const seedCategories = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('MongoDB connected for Categories seeding...');

        await Category.deleteMany();
        console.log('Old categories cleared.');

        await Category.insertMany(categories);
        console.log('New categories seeded successfully! 🚀');

        process.exit();
    } catch (error) {
        console.error('Seeding error:', error);
        process.exit(1);
    }
};

seedCategories();
