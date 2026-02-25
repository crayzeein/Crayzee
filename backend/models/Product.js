const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  text: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  images: [
    {
      url: { type: String, required: true },
      public_id: { type: String, required: true }
    }
  ],
  category: {
    type: String,
    required: true,
    index: true,
    default: 'clothing'
  },
  gender: {
    type: String,
    required: true,
    enum: ['men', 'women', 'unisex'],
    index: true
  },
  subCategory: {
    type: String,
    required: true,
    index: true
  },
  stock: { type: Number, required: true, min: 0, default: 0 },
  sizes: [String],
  rating: { type: Number, default: 0, index: true },
  numReviews: { type: Number, default: 0 },
  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  comments: [commentSchema],
  isFeatured: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now, index: true }
});

productSchema.index({ category: 1, gender: 1, subCategory: 1 });
productSchema.index({ price: 1 });
productSchema.index({ name: 'text', description: 'text' });

module.exports = mongoose.model('Product', productSchema);
