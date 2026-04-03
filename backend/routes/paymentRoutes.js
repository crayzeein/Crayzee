const express = require('express');
const router = express.Router();
const { createRazorpayOrder, verifyPayment, getRazorpayKey } = require('../controllers/paymentController');
const { protect } = require('../middleware/auth');

// GET Razorpay public key
router.get('/key', getRazorpayKey);

// Create Razorpay order (requires login)
router.post('/create-order', protect, createRazorpayOrder);

// Verify payment signature (requires login)
router.post('/verify', protect, verifyPayment);

module.exports = router;
