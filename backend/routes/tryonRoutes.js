const express = require('express');
const router = express.Router();
const { upload } = require('../utils/cloudinary');
const { generateTryOn } = require('../controllers/tryonController');

// @desc    Generate AI Virtual Try-On
// @route   POST /api/tryon/generate
// @access  Public (rate limited by IP)
router.post('/generate', upload.single('userPhoto'), generateTryOn);

module.exports = router;
