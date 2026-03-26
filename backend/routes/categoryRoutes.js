const express = require('express');
const router = express.Router();
const {
  getCategories,
  getAdminCategories,
  createCategory,
  updateCategory,
  deleteCategory
} = require('../controllers/categoryController');
const { protect, admin } = require('../middleware/auth');

router.get('/', getCategories);
router.get('/admin', protect, admin, getAdminCategories);
router.post('/', protect, admin, createCategory);
router.put('/:id', protect, admin, updateCategory);
router.delete('/:id', protect, admin, deleteCategory);

module.exports = router;
