const Order = require('../models/Order');
const Product = require('../models/Product');

exports.addOrderItems = async (req, res) => {
  const { orderItems, shippingAddress, paymentMethod, totalPrice, isPaid, paidAt, paymentResult } = req.body;

  if (!orderItems || orderItems.length === 0) {
    return res.status(400).json({ message: 'No order items' });
  }

  const session = await Product.startSession();
  try {
    session.startTransaction();

    // 1. Validate and Deduct stock for all items
    for (const item of orderItems) {
      const product = await Product.findById(item.product).session(session);
      if (!product) {
        throw new Error(`Product not found: ${item.name}`);
      }
      if (product.stock < item.qty) {
        throw new Error(`Insufficient stock for ${item.name}. Available: ${product.stock}`);
      }

      // Deduct stock
      product.stock -= item.qty;
      await product.save({ session });
    }

    // 2. Create the order
    const order = new Order({
      orderItems,
      user: req.user._id,
      shippingAddress,
      paymentMethod,
      totalPrice,
      isPaid: isPaid || false,
      paidAt: isPaid ? (paidAt || Date.now()) : undefined,
      paymentResult: paymentResult || {},
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
