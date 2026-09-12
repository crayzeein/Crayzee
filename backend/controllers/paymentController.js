const Razorpay = require('razorpay');
const crypto = require('crypto');
const Order = require('../models/Order');
const PendingPayment = require('../models/PendingPayment');
const { sendOrphanPaymentAlert } = require('../utils/emailService');

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET
});

// Create a Razorpay order
exports.createRazorpayOrder = async (req, res) => {
  try {
    const { amount } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({ message: 'Invalid amount' });
    }

    const options = {
      amount: Math.round(amount * 100), // Razorpay expects paise (₹1 = 100 paise)
      currency: 'INR',
      receipt: `receipt_${Date.now()}`,
      notes: {
        userId: req.user._id.toString()
      }
    };

    const order = await razorpay.orders.create(options);
    res.json({
      id: order.id,
      amount: order.amount,
      currency: order.currency,
      key: process.env.RAZORPAY_KEY_ID
    });
  } catch (error) {
    console.error('Razorpay order creation failed:', error);
    res.status(500).json({ message: 'Payment initiation failed. Please try again.' });
  }
};

// Verify payment signature
exports.verifyPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({ message: 'Missing payment details', verified: false });
    }

    const body = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest('hex');

    const isValid = expectedSignature === razorpay_signature;

    if (isValid) {
      res.json({
        verified: true,
        paymentId: razorpay_payment_id,
        orderId: razorpay_order_id
      });
    } else {
      res.status(400).json({ message: 'Payment verification failed', verified: false });
    }
  } catch (error) {
    console.error('Payment verification error:', error);
    res.status(500).json({ message: 'Verification error', verified: false });
  }
};

// Get Razorpay key (public - for frontend)
exports.getRazorpayKey = (req, res) => {
  res.json({ key: process.env.RAZORPAY_KEY_ID });
};

// Razorpay webhook — the safety net when the browser dies mid-checkout
exports.razorpayWebhook = async (req, res) => {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
  if (!secret) return res.status(500).json({ message: 'Webhook secret not configured' });

  const expected = crypto.createHmac('sha256', secret).update(req.body).digest('hex');
  if (expected !== req.headers['x-razorpay-signature']) {
    return res.status(400).json({ message: 'Invalid webhook signature' });
  }

  // Acknowledge immediately so Razorpay never retries on our processing time
  res.json({ received: true });

  try {
    const event = JSON.parse(req.body.toString());
    if (event.event !== 'payment.captured') return;

    const p = event.payload.payment.entity;
    if (await Order.exists({ 'paymentResult.id': p.id })) return;

    // The browser may still be mid-request, so give it a grace period before alarming
    await new Promise(resolve => setTimeout(resolve, 60000));
    if (await Order.exists({ 'paymentResult.id': p.id })) return;

    // Browser never reached POST /api/orders — record it so the money is not silently lost
    const pending = await PendingPayment.findOneAndUpdate(
      { paymentId: p.id },
      { paymentId: p.id, razorpayOrderId: p.order_id, amount: p.amount / 100, email: p.email, contact: p.contact },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    sendOrphanPaymentAlert(pending).catch(err => console.error('Orphan alert failed:', err.message));
  } catch (error) {
    console.error('Webhook processing error:', error.message);
  }
};
