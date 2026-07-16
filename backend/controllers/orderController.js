const Order = require('../models/Order');
const Product = require('../models/Product');
const crypto = require('crypto');
const Razorpay = require('razorpay');

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET
});

// Shipping rule — kept in sync with the checkout summary
const calcShipping = (subtotal) => (subtotal > 1500 ? 0 : 99);

exports.addOrderItems = async (req, res) => {
  const {
    orderItems,
    shippingAddress,
    paymentMethod,
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature
  } = req.body;

  if (!orderItems || orderItems.length === 0) {
    return res.status(400).json({ message: 'No order items' });
  }

  // For online payments, verify the Razorpay signature BEFORE touching the DB.
  // This proves the payment is genuine — we never trust an "isPaid" flag from the client.
  if (paymentMethod === 'Razorpay') {
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({ message: 'Missing payment verification details' });
    }
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');
    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({ message: 'Payment verification failed' });
    }
  }

  const session = await Product.startSession();
  try {
    session.startTransaction();

    // 1. Validate stock, deduct it, and rebuild each line item from the DB
    // (name/price/image come from the trusted product record, never the client).
    let itemsSubtotal = 0;
    const validatedItems = [];
    for (const item of orderItems) {
      const product = await Product.findById(item.product).session(session);
      if (!product) {
        throw new Error(`Product not found: ${item.name || item.product}`);
      }
      const qty = Math.max(1, parseInt(item.qty, 10) || 0);
      if (product.stock < qty) {
        throw new Error(`Insufficient stock for ${product.name}. Available: ${product.stock}`);
      }

      product.stock -= qty;
      await product.save({ session });

      itemsSubtotal += product.price * qty;
      validatedItems.push({
        name: product.name,
        qty,
        image: product.images?.[0]?.url || item.image,
        price: product.price,
        size: item.size,
        product: product._id
      });
    }

    // 2. Compute the authoritative total on the server
    const totalPrice = itemsSubtotal + calcShipping(itemsSubtotal);

    // 3. Resolve payment status
    let isPaid = false;
    let paidAt;
    let paymentResult = {};
    if (paymentMethod === 'Razorpay') {
      // Bind the payment to the exact amount we computed — stops a tampered
      // low-value Razorpay order from paying for a high-value cart.
      const rpOrder = await razorpay.orders.fetch(razorpay_order_id);
      if (!rpOrder || rpOrder.amount !== Math.round(totalPrice * 100)) {
        throw new Error('Payment amount mismatch. Please contact support.');
      }
      isPaid = true;
      paidAt = Date.now();
      paymentResult = {
        id: razorpay_payment_id,
        status: 'completed',
        update_time: new Date().toISOString(),
        email_address: req.user.email
      };
    }

    // 4. Create the order
    const order = new Order({
      orderItems: validatedItems,
      user: req.user._id,
      shippingAddress,
      paymentMethod,
      totalPrice,
      isPaid,
      paidAt,
      paymentResult,
      status: 'Processing'
    });

    const createdOrder = await order.save({ session });

    await session.commitTransaction();
    session.endSession();

    res.status(201).json(createdOrder);
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    res.status(400).json({ message: error.message });
  }
};

exports.getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate('user', 'name email');
    if (order) {
      if (order.user._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Not authorized' });
      }
      res.json(order);
    } else {
      res.status(404).json({ message: 'Order not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getMyOrders = async (req, res) => {
  const orders = await Order.find({ user: req.user._id });
  res.json(orders);
};

// Admin routes
exports.getOrders = async (req, res) => {
  const orders = await Order.find({}).populate('user', 'id name');
  res.json(orders);
};

exports.updateOrderToDelivered = async (req, res) => {
  const order = await Order.findById(req.params.id);
  if (order) {
    if (order.status !== 'Shipped') {
      return res.status(400).json({ message: 'Order must be Shipped before it can be Delivered' });
    }
    order.isDelivered = true;
    order.deliveredAt = Date.now();
    order.status = 'Delivered';
    const updatedOrder = await order.save();
    res.json(updatedOrder);
  } else {
    res.status(404).json({ message: 'Order not found' });
  }
};

exports.updateOrderToShipped = async (req, res) => {
  const order = await Order.findById(req.params.id);
  if (order) {
    if (order.status !== 'Processing') {
      return res.status(400).json({ message: 'Only Processing orders can be Shipped' });
    }
    order.status = 'Shipped';
    const updatedOrder = await order.save();
    res.json(updatedOrder);
  } else {
    res.status(404).json({ message: 'Order not found' });
  }
};

exports.cancelOrder = async (req, res) => {
  const order = await Order.findById(req.params.id);
  if (!order) {
    return res.status(404).json({ message: 'Order not found' });
  }

  if (order.status !== 'Processing') {
    return res.status(400).json({ message: `Cannot cancel an order that is already ${order.status}` });
  }

  const session = await Product.startSession();
  try {
    session.startTransaction();

    // Restore stock
    for (const item of order.orderItems) {
      const product = await Product.findById(item.product).session(session);
      if (product) {
        product.stock += item.qty;
        await product.save({ session });
      }
    }

    order.status = 'Cancelled';
    const updatedOrder = await order.save({ session });

    await session.commitTransaction();
    session.endSession();
    res.json(updatedOrder);
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    res.status(500).json({ message: error.message });
  }
};

exports.updateOrderToPaid = async (req, res) => {
  // This endpoint marks an order paid without a payment gateway proof, so it is
  // restricted to admins only (e.g. to reconcile a COD/manual payment).
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Not authorized' });
  }
  const order = await Order.findById(req.params.id);
  if (order) {
    order.isPaid = true;
    order.paidAt = Date.now();
    order.paymentResult = {
      id: req.body.id,
      status: req.body.status,
      update_time: req.body.update_time,
      email_address: req.body.email_address
    };

    const updatedOrder = await order.save();
    res.json(updatedOrder);
  } else {
    res.status(404).json({ message: 'Order not found' });
  }
};
