const express = require('express');
const router = express.Router();
const rateLimit = require('express-rate-limit');
const { trackVisit, getAnalyticsDashboard } = require('../controllers/analyticsController');
const { protect, admin } = require('../middleware/auth');

const visitLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 60,
  standardHeaders: true,
  legacyHeaders: false,
});

router.post('/visit', visitLimiter, trackVisit);
router.get('/dashboard', protect, admin, getAnalyticsDashboard);

module.exports = router;
