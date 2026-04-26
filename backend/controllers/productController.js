const Product = require('../models/Product');
const { cloudinary } = require('../utils/cloudinary');

// Get unique subcategories for a given category/gender
exports.getSubCategories = async (req, res) => {
  try {
    const { category, gender } = req.query;
    const filter = {};
    if (category && category !== 'all') filter.category = category;
    if (gender && gender !== 'all') filter.gender = gender;

    const subcats = await Product.distinct('subCategory', filter);
    // Filter out empty/null values
    const cleaned = subcats.filter(s => s && s.trim() !== '');
    res.json(cleaned);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getSuggestions = async (req, res) => {
  try {
    const { q } = req.query;
    if (!q) return res.json([]);

    const regex = new RegExp(q, 'i');
    const suggestions = await Product.find({
      $or: [
        { name: regex },
        { category: regex },
        { subCategory: regex },
        { gender: regex }
      ]
    })
      .limit(8)
      .select('name price images category subCategory gender')
      .lean();

    // Map images to return first image url for suggestions
    const formatted = suggestions.map(s => ({
      ...s,
      image: s.images && s.images[0] ? s.images[0].url : ''
    }));

    res.json(formatted);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getProducts = async (req, res) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 12;
    const skip = (page - 1) * limit;

    const { category, gender, subCategory, search, minPrice, maxPrice, sort, rating, sizes, isFeatured } = req.query;
    let query = {};

    if (category) query.category = category;
    if (gender && gender !== 'all') query.gender = gender;
    if (subCategory && subCategory !== 'all') query.subCategory = subCategory;
    if (isFeatured) query.isFeatured = isFeatured === 'true';

    // Validate Numeric Inputs
    if (rating && !isNaN(Number(rating))) {
      query.rating = { $gte: Number(rating) };
    }

    // Safety: Escape regex special characters
    const escapeRegex = (string) => {
      return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    };

    if (search) {
      // Clean query: remove common punctuation but keep alphanumeric and spaces
      // This helps with queries like "blu," or "shirt!"
      const cleanSearch = search.replace(/[.,!?;:]/g, ' ').trim();
      const keywords = cleanSearch.split(/\s+/).filter(word => word.length > 0);

      if (keywords.length > 0) {
        // Build a query where EACH keyword must match at least one of the fields
        query.$and = keywords.map(kw => {
          const safeKw = escapeRegex(kw);
          const regex = new RegExp(safeKw, 'i');
          return {
            $or: [
              { name: regex },
              { description: regex },
              { category: regex },
              { subCategory: regex },
              { gender: regex }
            ]
          };
        });
      }
    }

    if (sizes) {
      const sizeArray = Array.isArray(sizes) ? sizes : sizes.split(',');
      query.sizes = { $in: sizeArray.map(s => s.trim()).filter(s => s !== '') };
    }

    if (minPrice || maxPrice) {
      query.price = {};
      const min = Number(minPrice);
      const max = Number(maxPrice);
      if (minPrice && !isNaN(min)) query.price.$gte = min;
      if (maxPrice && !isNaN(max)) query.price.$lte = max;
      if (Object.keys(query.price).length === 0) delete query.price;
    }

    let sortQuery = { createdAt: -1 };
    if (sort === 'oldest') sortQuery = { createdAt: 1 };
    if (sort === 'priceLow') sortQuery = { price: 1 };
    if (sort === 'priceHigh') sortQuery = { price: -1 };
    if (sort === 'popular') sortQuery = { rating: -1, numReviews: -1 };

    console.log('--- Product Query ---');
    console.log('Query:', JSON.stringify(query));
    console.log('Sort:', JSON.stringify(sortQuery));

    const count = await Product.countDocuments(query);
    const products = await Product.find(query)
      .sort(sortQuery)
      .skip(skip)
      .limit(limit)
      .select('name price images category subCategory gender stock isFeatured createdAt rating numReviews reviews')
      .lean();

    console.log(`Found ${products.length} products (Total: ${count})`);

    const formatted = products.map(p => ({
      ...p,
      image: p.images && p.images[0] ? p.images[0].url : ''
    }));

    res.json({
      products: formatted,
      page,
      pages: Math.ceil(count / limit),
      total: count
    });
  } catch (error) {
    console.error('SERVER ERROR (getProducts):', error);
    res.status(500).json({ message: error.message });
  }
};

exports.getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (product) {
      res.json(product);
    } else {
      res.status(404).json({ message: 'Product not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getSimilarProducts = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });

    // Try: same gender + same subCategory, excluding current product
    let similar = await Product.find({
      _id: { $ne: product._id },
      gender: product.gender,
      subCategory: product.subCategory
    })
      .limit(12)
      .select('name price images category subCategory gender stock rating numReviews')
      .lean();

    // Fallback: if less than 4, also pull from same gender + category
    if (similar.length < 4) {
      const moreIds = similar.map(s => s._id);
      const more = await Product.find({
        _id: { $ne: product._id, $nin: moreIds },
        gender: product.gender,
        category: product.category
      })
        .limit(12 - similar.length)
        .select('name price images category subCategory gender stock rating numReviews')
        .lean();
      similar = [...similar, ...more];
    }

    const formatted = similar.map(p => ({
      ...p,
      image: p.images && p.images[0] ? p.images[0].url : ''
    }));

    res.json(formatted);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.createProduct = async (req, res) => {
  try {
    const { name, description, price, category, gender, subCategory, stock, isFeatured, sizes } = req.body;

    // Images should be sent as an array of objects { url, public_id }
    // which were uploaded via a separate endpoint or previously
    const images = req.body.images || [];

    let productSizes = [];
    if (sizes) {
      if (typeof sizes === 'string') {
        productSizes = sizes.split(',');
      } else if (Array.isArray(sizes)) {
        productSizes = sizes;
      }
    }

    const product = new Product({
      name,
      description,
      price,
      images,
      category,
      gender,
      subCategory,
      stock,
      isFeatured,
      sizes: productSizes
    });

    const createdProduct = await product.save();
    res.status(201).json(createdProduct);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (product) {
      // If new images are provided, we might want to delete old ones from Cloudinary
      // but usually we handle image deletion via a separate "Delete Image" action
      // For now, let's just update fields
      const { name, description, price, category, gender, subCategory, stock, isFeatured, sizes, images } = req.body;

      if (sizes && typeof sizes === 'string') {
        product.sizes = sizes.split(',');
      } else if (Array.isArray(sizes)) {
        product.sizes = sizes;
      }

      product.name = name || product.name;
      product.description = description || product.description;
      product.price = price || product.price;
      product.category = category || product.category;
      product.gender = gender || product.gender;
      product.subCategory = subCategory || product.subCategory;
      product.stock = stock !== undefined ? stock : product.stock;
      product.isFeatured = isFeatured !== undefined ? isFeatured : product.isFeatured;
      product.images = images || product.images;

      const updatedProduct = await product.save({ runValidators: true });
      res.json(updatedProduct);
    } else {
      res.status(404).json({ message: 'Product not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (product) {
      // Delete images from Cloudinary
      if (product.images && product.images.length > 0) {
        const deletePromises = product.images.map(img =>
          cloudinary.uploader.destroy(img.public_id)
        );
        await Promise.all(deletePromises);
      }

      await product.deleteOne();
      res.json({ message: 'Product removed' });
    } else {
      res.status(404).json({ message: 'Product not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.likeProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (product) {
      const alreadyLiked = product.likes.find(l => l.toString() === req.user._id.toString());
      if (alreadyLiked) {
        product.likes = product.likes.filter(l => l.toString() !== req.user._id.toString());
      } else {
        product.likes.push(req.user._id);
      }
      await product.save();
      res.json(product);
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.createProductReview = async (req, res) => {
  try {
    const { rating, comment } = req.body;
    const product = await Product.findById(req.params.id);

    if (product) {
      const alreadyReviewed = product.reviews.find(
        (r) => r.user.toString() === req.user._id.toString()
      );

      if (alreadyReviewed) {
        // Update existing review
        alreadyReviewed.rating = Number(rating);
        alreadyReviewed.comment = comment;
        alreadyReviewed.createdAt = Date.now();

        product.rating =
          product.reviews.reduce((acc, item) => item.rating + acc, 0) /
          product.reviews.length;

        await product.save();
        return res.status(200).json({ message: 'Review updated' });
      }

      const review = {
        name: req.user.name,
        rating: Number(rating),
        comment,
        user: req.user._id,
      };

      product.reviews.push(review);
      product.numReviews = product.reviews.length;
      product.rating =
        product.reviews.reduce((acc, item) => item.rating + acc, 0) /
        product.reviews.length;

      await product.save();
      res.status(201).json({ message: 'Review added' });
    } else {
      res.status(404).json({ message: 'Product not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteReview = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (product) {
      product.reviews = product.reviews.filter(
        (r) => r._id.toString() !== req.params.reviewId
      );

      product.numReviews = product.reviews.length;
      if (product.numReviews > 0) {
        product.rating =
          product.reviews.reduce((acc, item) => item.rating + acc, 0) /
          product.numReviews;
      } else {
        product.rating = 0;
      }

      await product.save();
      res.json({ message: 'Review removed' });
    } else {
      res.status(404).json({ message: 'Product not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
