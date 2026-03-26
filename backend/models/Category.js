const mongoose = require('mongoose');

const itemSchema = new mongoose.Schema({
  label: { type: String, required: true },
  href: { type: String, required: true }
});

const categorySchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  slug: { type: String, required: true, unique: true },
  items: [itemSchema],
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('Category', categorySchema);
