const Category = require('../models/Category');
const Product = require('../models/Product');

exports.getCategories = async (req, res) => {
  try {
    const categories = await Category.find({ isActive: true });
    
    const filteredCategories = [];
    for (const cat of categories) {
      const productCount = await Product.countDocuments({ 
        $or: [
          { category: cat.name },
          { category: cat.slug },
          // also allow case-insensitive match just in case
          { category: { $regex: new RegExp(`^${cat.name}$`, 'i') } }
        ]
      });
      // Filter out if empty as requested by user
      if (productCount > 0) {
        filteredCategories.push(cat);
      }
    }
    
    res.json(filteredCategories);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getAdminCategories = async (req, res) => {
  try {
    const categories = await Category.find({});
    res.json(categories);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.createCategory = async (req, res) => {
  try {
    const { name, slug, items, isActive } = req.body;
    const categoryExists = await Category.findOne({ name });
    if (categoryExists) {
      return res.status(400).json({ message: 'Category already exists' });
    }
    const category = await Category.create({ name, slug, items, isActive });
    res.status(201).json(category);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.updateCategory = async (req, res) => {
  try {
    const { name, slug, items, isActive } = req.body;
    const category = await Category.findById(req.params.id);
    if (category) {
      category.name = name || category.name;
      category.slug = slug || category.slug;
      if (items !== undefined) category.items = items;
      if (isActive !== undefined) category.isActive = isActive;
      const updatedCategory = await category.save();
      res.json(updatedCategory);
    } else {
      res.status(404).json({ message: 'Category not found' });
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.deleteCategory = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (category) {
      await Category.deleteOne({ _id: category._id });
      res.json({ message: 'Category removed' });
    } else {
      res.status(404).json({ message: 'Category not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
