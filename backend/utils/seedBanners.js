const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const mongoose = require('mongoose');
const Banner = require('../models/Banner');

const banners = [
    {
        title1: "URBAN",
        title2: "REVOLUTION",
        subtitle: "India's wildest streetwear drop is here. High-octane aesthetics for the rule breakers.",
        badge: "Limited Drop",
        image: "https://images.unsplash.com/photo-1552374196-1ab2a1c593e8?auto=format&fit=crop&q=80&w=1200",
        link: "/browse",
        order: 1
    },
    {
        title1: "CYBER",
        title2: "CORE 2026",
        subtitle: "Step into the future with our tech-wear inspired series. Functional. Fearless. Futuristic.",
        badge: "Techwear",
        image: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&q=80&w=1200",
        link: "/browse",
        order: 2
    },
    {
        title1: "STREET",
        title2: "LEGENDS",
        subtitle: "The classic oversized collection. Crafted for maximum comfort and ultimate street cred.",
        badge: "Oversized",
        image: "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?auto=format&fit=crop&q=80&w=1200",
        link: "/browse",
        order: 3
    }
];

const seedBanners = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('MongoDB connected for seeding...');

        await Banner.deleteMany();
        console.log('Old banners cleared.');

        await Banner.insertMany(banners);
        console.log('New banners seeded successfully! 🚀');

        process.exit();
    } catch (error) {
        console.error('Seeding error:', error);
        process.exit(1);
    }
};

seedBanners();
