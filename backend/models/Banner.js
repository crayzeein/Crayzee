const mongoose = require('mongoose');

const bannerSchema = new mongoose.Schema({
    title1: { type: String, required: true },
    title2: { type: String, required: true },
    subtitle: { type: String, required: true },
    badge: { type: String, default: 'Exclusive Drop' },
    image: { type: String, required: true },
    link: { type: String, default: '/browse' },
    order: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Banner', bannerSchema);
