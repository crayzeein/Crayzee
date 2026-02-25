const express = require('express');
const router = express.Router();
const { getAllUsers, deleteUser, toggleBlockUser, toggleWishlist, getWishlist } = require('../controllers/userController');
const { protect, admin } = require('../middleware/auth');

// Admin routes
router.get('/', protect, admin, getAllUsers);
router.delete('/:id', protect, admin, deleteUser);
router.put('/:id/block', protect, admin, toggleBlockUser);

// Private user routes
router.get('/wishlist', protect, getWishlist);
router.post('/wishlist/:productId', protect, toggleWishlist);

module.exports = router;
