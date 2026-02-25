const Banner = require('../models/Banner');

exports.getBanners = async (req, res) => {
    try {
        const banners = await Banner.find({ isActive: true }).sort('order');
        res.json(banners);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.createBanner = async (req, res) => {
    try {
        const banner = await Banner.create(req.body);
        res.status(201).json(banner);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

exports.deleteBanner = async (req, res) => {
    try {
        await Banner.findByIdAndDelete(req.params.id);
        res.json({ message: 'Banner removed' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
