const User = require('../models/User');
const Product = require('../models/Product');

// @desc    Add item to cart
// @route   POST /api/cart
// @access  Private
exports.addToCart = async (req, res) => {
    const { productId, qty, size } = req.body;

    try {
        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        if (product.stock < qty) {
            return res.status(400).json({ message: 'Insufficient stock' });
        }

        const user = await User.findById(req.user._id);

        const cartItemIndex = user.cart.findIndex(
            (item) => item.product.toString() === productId && item.size === size
        );

        if (cartItemIndex > -1) {
            // Check if total qty exceeds stock
            if (product.stock < user.cart[cartItemIndex].qty + qty) {
                return res.status(400).json({ message: 'Cannot add more, stock limit reached' });
            }
            user.cart[cartItemIndex].qty += qty;
        } else {
            user.cart.push({ product: productId, qty, size });
        }

        await user.save();
        res.status(200).json(user.cart);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get user cart
// @route   GET /api/cart
// @access  Private
exports.getCart = async (req, res) => {
    try {
        const user = await User.findById(req.user._id).populate('cart.product');
        res.json(user.cart);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Remove item from cart
// @route   DELETE /api/cart/:itemId
// @access  Private
exports.removeFromCart = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        user.cart = user.cart.filter((item) => item._id.toString() !== req.params.itemId);
        await user.save();
        res.json(user.cart);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update cart item quantity
// @route   PUT /api/cart/:itemId
// @access  Private
exports.updateCartQty = async (req, res) => {
    const { qty } = req.body;
    try {
        const user = await User.findById(req.user._id).populate('cart.product');
        const item = user.cart.find((i) => i._id.toString() === req.params.itemId);

        if (!item) {
            return res.status(404).json({ message: 'Item not found in cart' });
        }

        if (item.product.stock < qty) {
            return res.status(400).json({ message: 'Insufficient stock' });
        }

        item.qty = qty;
        await user.save();
        res.json(user.cart);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
