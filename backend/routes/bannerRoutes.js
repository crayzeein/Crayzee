const express = require('express');
const router = express.Router();
const { getBanners, createBanner, deleteBanner } = require('../controllers/bannerController');
const { protect, admin } = require('../middleware/auth');

router.get('/', getBanners);
router.post('/', protect, admin, createBanner);
router.delete('/:id', protect, admin, deleteBanner);

module.exports = router;
