const express = require('express');
const router = express.Router();
const {
  getProducts,
  getSuggestions,
  getSubCategories,
  getProductById,
  getSimilarProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  likeProduct,
  createProductReview,
  deleteReview
} = require('../controllers/productController');
const { protect, admin } = require('../middleware/auth');

router.get('/', getProducts);
router.get('/suggestions', getSuggestions);
router.get('/subcategories', getSubCategories);
router.get('/:id/similar', getSimilarProducts);
router.get('/:id', getProductById);
router.post('/', protect, admin, createProduct);
router.put('/:id', protect, admin, updateProduct);
router.delete('/:id', protect, admin, deleteProduct);
router.post('/:id/like', protect, likeProduct);
router.post('/:id/reviews', protect, createProductReview);
router.delete('/:id/reviews/:reviewId', protect, admin, deleteReview);

module.exports = router;
