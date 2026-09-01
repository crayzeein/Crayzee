const express = require('express');
const router = express.Router();
const rateLimit = require('express-rate-limit');
const { upload } = require('../utils/cloudinary');
const { generateTryOn } = require('../controllers/tryonController');
const { protect } = require('../middleware/auth');

const tryonLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 6,
  message: { message: 'Too many try-on requests from this network. Please wait a few minutes.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// @desc    Generate AI Virtual Try-On
// @route   POST /api/tryon/generate
// @access  Private (authenticated users only, rate limited)
router.post('/generate', protect, tryonLimiter, upload.single('userPhoto'), generateTryOn);

module.exports = router;
