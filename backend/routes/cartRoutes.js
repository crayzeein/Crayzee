const express = require('express');
const router = express.Router();
const { addToCart, getCart, removeFromCart, updateCartQty } = require('../controllers/cartController');
const { protect } = require('../middleware/auth');

router.use(protect); // All cart routes are protected

router.route('/')
    .get(getCart)
    .post(addToCart);

router.route('/:itemId')
    .put(updateCartQty)
    .delete(removeFromCart);

module.exports = router;
