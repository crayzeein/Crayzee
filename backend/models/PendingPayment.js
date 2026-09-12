const mongoose = require('mongoose');

// Money received by Razorpay for which no Order exists — needs manual reconciliation
const pendingPaymentSchema = new mongoose.Schema({
  paymentId: { type: String, required: true, unique: true },
  razorpayOrderId: { type: String },
  amount: { type: Number, required: true },
  email: { type: String },
  contact: { type: String },
  resolved: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model('PendingPayment', pendingPaymentSchema);
